const moment = require("moment");
const path = require("path");
const fs = require("fs").promises;

const MainContracts = require("./refreshMainContracts.js");
const VarietyPositions = require("./refreshVarietyPositons.js");
const BrokerStructure = require("./refreshBrokerStructure.js");
const VarietyProfits = require("./updateVarietyProfits.js");

const exchangeDays = require("../config/exChangeDay.js");
const {
    getRunMode,
    getTaskOptions,
    normalizeInput,
} = require("./config.js");

const positionPath = path.join(process.cwd(), "app", "public/data/position.json");

function formatDuration(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
}

async function runPhase(label, task) {
    const start = Date.now();
    console.log(`▶ ${label} 开始`);
    try {
        const result = await task();
        console.log(`✓ ${label} 完成，用时 ${formatDuration(Date.now() - start)}`);
        return result;
    } catch (error) {
        console.error(`✗ ${label} 失败，用时 ${formatDuration(Date.now() - start)}`);
        throw error;
    }
}

function getReadyTime(now) {
    return now.clone().hour(9).minute(30).second(0).millisecond(0);
}

function isTodayReady(today) {
    const now = moment();
    const readyTime = getReadyTime(now);
    if (today !== moment().format("YYYY-MM-DD")) {
        return true;
    }

    return !now.isBefore(readyTime);
}

function ensureReadyForToday(today) {
    if (!isTodayReady(today)) {
        console.log("🔄 还没到更新时间");
        process.exit(1);
    }
}

async function loadPositionData() {
    const positionRaw = await fs.readFile(positionPath, "utf-8");
    return JSON.parse(positionRaw);
}

function getLastSavedTradingDay(positionData) {
    const lastSavedDate = positionData[positionData.length - 1]?.date;
    const lastSavedIndex = exchangeDays.findIndex(date => date === lastSavedDate);

    if (!lastSavedDate || lastSavedIndex < 0) {
        console.log("历史数据不对");
        process.exit(1);
    }

    return {
        lastSavedDate,
        lastSavedIndex,
    };
}

function resolveTradingDay(date, label) {
    if (!date) {
        return "";
    }

    if (exchangeDays.includes(date)) {
        return date;
    }

    const fallback = [...exchangeDays].reverse().find(item => item <= date);
    if (!fallback) {
        console.log(`❌${label} ${date} 不在交易日列表中`);
        process.exit(1);
    }

    console.log(`⚠️${label} ${date} 不是交易日，已自动回退到 ${fallback}`);
    return fallback;
}

function getLatestReadyTradingDay(today) {
    const latestReadyDate = [...exchangeDays].reverse().find(date => (
        date < today || (date === today && isTodayReady(today))
    ));

    if (!latestReadyDate) {
        console.log("❌没有可补齐的已就绪交易日");
        process.exit(1);
    }

    if (latestReadyDate !== today) {
        console.log(`ℹ️今日数据未就绪，补数结束日期自动回退到 ${latestReadyDate}`);
    }

    return latestReadyDate;
}

function getPendingBackfillDates(lastSavedIndex, today) {
    const configuredStartDate = normalizeInput(process.env.BACKFILL_START_DATE);
    const configuredEndDate = normalizeInput(process.env.BACKFILL_END_DATE);
    const defaultEndDate = configuredEndDate ? "" : getLatestReadyTradingDay(today);
    const firstMissingDate = exchangeDays[lastSavedIndex + 1];
    const hasConfiguredRange = Boolean(configuredStartDate || configuredEndDate);

    if (!firstMissingDate && !hasConfiguredRange) {
        return {
            endDate: "",
            pendingDates: [],
        };
    }

    let startDate = firstMissingDate;
    if (configuredStartDate) {
        startDate = resolveTradingDay(configuredStartDate, "补数开始日期");
    }

    if (!startDate) {
        console.log("ℹ️当前历史数据已到最新交易日，没有自动补数区间");
        return {
            endDate: "",
            pendingDates: [],
        };
    }

    const endDate = resolveTradingDay(configuredEndDate || defaultEndDate, "补数结束日期");
    if (endDate < startDate) {
        console.log(`ℹ️补数结束日期 ${endDate} 早于补数开始日期 ${startDate}，无需补数`);
        return {
            endDate,
            pendingDates: [],
        };
    }

    const pendingDates = exchangeDays.filter(date => date >= startDate && date <= endDate);
    const modeText = hasConfiguredRange ? "指定修复区间" : "自动补齐区间";
    console.log(`📦 本次${modeText}: ${startDate} -> ${endDate}，共 ${pendingDates.length} 个交易日`);

    return {
        endDate,
        pendingDates,
    };
}

async function runDailyUpdate(today, positionData) {
    if (!exchangeDays.includes(today)) {
        console.log("🔄 今日不是交易日，无需更新数据");
        process.exit(1);
    }

    const { lastSavedIndex } = getLastSavedTradingDay(positionData);
    if (exchangeDays[lastSavedIndex + 1] !== today) {
        console.log("❌数据不连续，请检查");
        process.exit(1);
    }

    ensureReadyForToday(today);

    const taskOptions = getTaskOptions();
    const varietiesList = await runPhase("刷新主力合约", () => new MainContracts(taskOptions).run({
        date: today,
        persist: true,
    }));
    const { typicalBroker } = await runPhase("更新盈亏与典型席位", () => new VarietyProfits(taskOptions).run({
        today,
        varietiesList,
    }));

    const varietyPositions = new VarietyPositions(taskOptions);
    await runPhase("更新持仓详情", () => varietyPositions.updateNearPosition(today, {
        varietiesList,
        typicalBrokerMap: typicalBroker,
    }));
    const { request } = varietyPositions.errorInfo;
    if (request && request.length) {
        console.warn("⚠️有接口请求失败了，需要补充数据完整性", JSON.stringify(request));
    }

    await runPhase("更新席位持仓结构", () => new BrokerStructure(taskOptions).execute({
        typicalBrokerMap: typicalBroker,
    }));
}

async function runBackfill(today, positionData) {
    const { lastSavedDate, lastSavedIndex } = getLastSavedTradingDay(positionData);
    const { endDate, pendingDates } = getPendingBackfillDates(lastSavedIndex, today);

    if (!pendingDates.length) {
        console.log(`ℹ️当前最新数据是 ${lastSavedDate}，没有需要补齐的交易日`);
        return;
    }

    if (pendingDates.includes(today)) {
        ensureReadyForToday(today);
    }

    const taskOptions = getTaskOptions();
    const profitEndDate = lastSavedDate > endDate ? lastSavedDate : endDate;
    const profitVarietiesList = await runPhase("刷新盈亏统计基准主力合约", () => new MainContracts(taskOptions).run({
        date: profitEndDate,
        persist: false,
    }));
    const { typicalBroker } = await runPhase("更新盈亏与典型席位", () => new VarietyProfits(taskOptions).run({
        today: profitEndDate,
        varietiesList: profitVarietiesList,
    }));

    const varietyPositions = new VarietyPositions(taskOptions);
    for (const date of pendingDates) {
        console.log(`\n🧩 开始补齐 ${date} 的数据`);
        const varietiesList = await runPhase(`补齐 ${date} 主力合约`, () => new MainContracts(taskOptions).run({
            date,
            persist: false,
        }));
        await runPhase(`补齐 ${date} 持仓详情`, () => varietyPositions.updateNearPosition(date, {
            varietiesList,
            typicalBrokerMap: typicalBroker,
        }));
    }

    const { request } = varietyPositions.errorInfo;
    if (request && request.length) {
        console.warn("⚠️有接口请求失败了，需要补充数据完整性", JSON.stringify(request));
    }

    await runPhase("写入最终主力合约配置", () => new MainContracts(taskOptions).saveData(profitVarietiesList));

    await runPhase("更新席位持仓结构", () => new BrokerStructure(taskOptions).execute({
        typicalBrokerMap: typicalBroker,
    }));
}

async function main() {
    console.log("now", moment().format("YYYY-MM-DD HH:mm:ss"));

    const today = moment().format("YYYY-MM-DD");
    const runMode = getRunMode();
    console.log("runMode", runMode);
    console.log("taskOptions", getTaskOptions());

    const positionData = await loadPositionData();

    if (runMode === "backfill") {
        await runPhase("补齐历史数据", () => runBackfill(today, positionData));
        return;
    }

    await runPhase("每日数据更新", () => runDailyUpdate(today, positionData));
}

main().catch((error) => {
    console.error("❌定时任务执行失败", error);
    process.exit(1);
});

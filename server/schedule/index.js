const moment = require("moment");
const path = require("path");
const fs = require("fs").promises;

const MainContracts = require("./refreshMainContracts.js");
const VarietyPositions = require("./refreshVarietyPositons.js");
const BrokerStructure = require("./refreshBrokerStructure.js");
const VarietyProfits = require("./updateVarietyProfits.js");

const exchangeDays = require("../config/exChangeDay.js");

const positionPath = path.join(process.cwd(), "app", "public/data/position.json");

function normalizeInput(value) {
    return typeof value === "string" ? value.trim() : "";
}

function getRunMode() {
    return normalizeInput(process.env.UPDATE_MODE) === "backfill" ? "backfill" : "daily";
}

function getReadyTime(now) {
    return now.clone().hour(9).minute(30).second(0).millisecond(0);
}

function ensureReadyForToday(today) {
    const now = moment();
    const readyTime = getReadyTime(now);
    if (today !== moment().format("YYYY-MM-DD")) {
        return;
    }
    if (now.isBefore(readyTime)) {
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

function getPendingBackfillDates(lastSavedIndex, today) {
    const configuredStartDate = normalizeInput(process.env.BACKFILL_START_DATE);
    const configuredEndDate = normalizeInput(process.env.BACKFILL_END_DATE) || today;
    const firstMissingDate = exchangeDays[lastSavedIndex + 1];

    if (!firstMissingDate) {
        return [];
    }

    let startDate = firstMissingDate;
    if (configuredStartDate) {
        const normalizedStartDate = resolveTradingDay(configuredStartDate, "补数开始日期");
        if (normalizedStartDate < firstMissingDate) {
            console.log(`⚠️补数开始日期 ${normalizedStartDate} 早于首个缺失交易日 ${firstMissingDate}，已自动从 ${firstMissingDate} 开始补齐`);
        } else {
            startDate = normalizedStartDate;
        }
    }

    const endDate = resolveTradingDay(configuredEndDate, "补数结束日期");
    if (endDate < startDate) {
        console.log(`ℹ️补数结束日期 ${endDate} 早于补数开始日期 ${startDate}，无需补数`);
        return [];
    }

    const pendingDates = exchangeDays.filter(date => date >= startDate && date <= endDate);
    console.log(`📦 本次补数区间: ${startDate} -> ${endDate}，共 ${pendingDates.length} 个交易日`);

    return pendingDates;
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

    await new MainContracts().run(today);
    await new VarietyProfits().run();

    const varietyPositions = new VarietyPositions();
    await varietyPositions.updateNearPosition(today);
    const { request } = varietyPositions.errorInfo;
    if (request && request.length) {
        console.warn("⚠️有接口请求失败了，需要补充数据完整性", JSON.stringify(request));
    }

    await new BrokerStructure().execute();
}

async function runBackfill(today, positionData) {
    const { lastSavedDate, lastSavedIndex } = getLastSavedTradingDay(positionData);
    const pendingDates = getPendingBackfillDates(lastSavedIndex, today);

    if (!pendingDates.length) {
        console.log(`ℹ️当前最新数据是 ${lastSavedDate}，没有需要补齐的交易日`);
        return;
    }

    if (pendingDates.includes(today)) {
        ensureReadyForToday(today);
    }

    await new VarietyProfits().run();

    const varietyPositions = new VarietyPositions();
    for (const date of pendingDates) {
        console.log(`\n🧩 开始补齐 ${date} 的数据`);
        await new MainContracts().run(date);
        await varietyPositions.updateNearPosition(date);
    }

    const { request } = varietyPositions.errorInfo;
    if (request && request.length) {
        console.warn("⚠️有接口请求失败了，需要补充数据完整性", JSON.stringify(request));
    }

    if (pendingDates[pendingDates.length - 1] !== today) {
        await new MainContracts().run();
    }

    await new BrokerStructure().execute();
}

async function main() {
    console.log("now", moment().format("YYYY-MM-DD HH:mm:ss"));

    const today = moment().format("YYYY-MM-DD");
    const runMode = getRunMode();
    const positionData = await loadPositionData();

    if (runMode === "backfill") {
        await runBackfill(today, positionData);
        return;
    }

    await runDailyUpdate(today, positionData);
}

main();

const path = require("path");
const fs = require("fs").promises;

const exchangeDays = require("../config/exChangeDay.js");
const { queryVarietyPostion } = require("../api/variety.js");
const { VARIETIES_LIST } = require("../config/index.js");
const typicalBrokerConfig = require("../config/typicalBroker.js");
const { createProgressLogger, mapWithConcurrency } = require("../utils/task.js");
const { DEFAULT_TASK_OPTIONS } = require("./config.js");

class PositionTask {
    constructor(options = {}) {
        this.errorInfo = {
            request: [],
            readFile: false,
        };
        this.outPath = path.join(process.cwd(), "app", "public/data/position.json");
        this.concurrency = options.concurrency || DEFAULT_TASK_OPTIONS.concurrency;
        this.delayMs = options.delayMs || DEFAULT_TASK_OPTIONS.delayMs;
        this.progressEvery = options.progressEvery || DEFAULT_TASK_OPTIONS.progressEvery;
    }

    async fetchVarietyPositionData(params, variety, typicalBrokerMap) {
        const { symbol } = variety || {};
        const typicalBrokers = typicalBrokerMap[symbol] || [];

        try {
            const data = await queryVarietyPostion(params);
            return {
                longPosition: (data.buy || []).filter(item => typicalBrokers.includes(item.broker)),
                shortPosition: (data.ss || []).filter(item => typicalBrokers.includes(item.broker)),
            };
        } catch (error) {
            this.errorInfo.request.push({
                date: params.date,
                variety: variety.name,
                code: params.code,
            });
            console.log(error);
            return {
                longPosition: [],
                shortPosition: [],
            };
        }
    }

    buildContractTasks(varietiesList) {
        return varietiesList.flatMap(variety =>
            ["all", ...variety.mainVariety].map(contract => ({
                variety,
                contract,
            }))
        );
    }

    async collectData(date, options = {}) {
        const varietiesList = options.varietiesList || VARIETIES_LIST;
        const typicalBrokerMap = options.typicalBrokerMap || typicalBrokerConfig;
        const varietyPosition = {};
        const contractTasks = this.buildContractTasks(varietiesList);

        const results = await mapWithConcurrency(
            contractTasks,
            async ({ variety, contract }) => {
                console.log(`🎸正在获取${variety.name}${contract}的持仓详情...`);
                const data = await this.fetchVarietyPositionData({
                    variety: variety.name,
                    code: contract,
                    date,
                }, variety, typicalBrokerMap);

                return {
                    symbol: variety.symbol,
                    contract,
                    data,
                };
            },
            {
                concurrency: this.concurrency,
                delayMs: this.delayMs,
                onProgress: createProgressLogger(`${date} 持仓详情`, {
                    every: this.progressEvery,
                }),
            }
        );

        for (const item of results) {
            if (!varietyPosition[item.symbol]) {
                varietyPosition[item.symbol] = {};
            }
            varietyPosition[item.symbol][item.contract] = item.data;
        }

        return varietyPosition;
    }

    async collectDatesData(dates, options = {}) {
        const dateRangeContractsPosition = [];
        for (let index = 0; index < dates.length; index += 1) {
            const progress = ((index + 1) / dates.length * 100).toFixed(1);
            process.stdout.write(`\r🔄 历史数据获取进度: ${index + 1}/${dates.length} (${progress}%)`);

            const dateStr = dates[index];
            const contractsPosition = await this.collectData(dateStr, options);
            dateRangeContractsPosition.push({
                date: dateStr,
                positions: contractsPosition,
            });
        }

        return dateRangeContractsPosition;
    }

    async loadData(file) {
        try {
            const raw = await fs.readFile(file, "utf-8");
            return JSON.parse(raw);
        } catch {
            this.errorInfo.readFile = true;
            return [];
        }
    }

    async updateLast30DaysPosition(options = {}) {
        const positions = await this.collectDatesData(exchangeDays, options);
        await fs.writeFile(this.outPath, JSON.stringify(positions), "utf-8");
        console.log("💯💯历史数据更新成功");
    }

    async updateNearPosition(date, options = {}) {
        const currentData = await this.loadData(this.outPath);
        const positions = await this.collectData(date, options);

        currentData.shift();
        currentData.push({
            date,
            positions,
        });

        await fs.writeFile(this.outPath, JSON.stringify(currentData), "utf-8");
    }
}

module.exports = PositionTask;

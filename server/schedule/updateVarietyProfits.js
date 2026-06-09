const path = require("path");
const fs = require("fs").promises;
const moment = require("moment");

const { queryVarietyProfit } = require("../api/variety.js");
const { VARIETIES_LIST } = require("../config/index");
const { createProgressLogger, mapWithConcurrency } = require("../utils/task.js");
const { DEFAULT_TASK_OPTIONS } = require("./config.js");

class VarietyProfitTask {
    constructor(options = {}) {
        this.appOutPath = path.join(process.cwd(), "app", "public/data/profit.json");
        this.serverOutpath = path.join(process.cwd(), "server", "config/typicalBroker.js");
        this.concurrency = options.concurrency || DEFAULT_TASK_OPTIONS.concurrency;
        this.delayMs = options.delayMs || DEFAULT_TASK_OPTIONS.delayMs;
        this.progressEvery = options.progressEvery || DEFAULT_TASK_OPTIONS.progressEvery;
    }

    async fetchVarietyProfitData(name, dates) {
        return queryVarietyProfit({
            variety: name,
            date1: dates[0],
            date2: dates[1],
        });
    }

    buildProfitEntry(variety, rangeData) {
        const profitByRange = {};
        const brokerSet = new Set();

        for (const [rangeType, data] of Object.entries(rangeData)) {
            const { brokers, value } = data || {};
            const profits = (brokers || []).map((name, index) => ({
                broker: name,
                value: (value || [])[index] || 0,
            }));

            const sortedProfits = [...profits].sort((a, b) => b.value - a.value);
            const winners = sortedProfits.slice(0, 6).filter(item => item.value > 0);
            const losers = sortedProfits.slice(-6).filter(item => item.value < 0);
            const currentRangeProfits = [...winners, ...losers];

            profitByRange[rangeType] = currentRangeProfits;
            currentRangeProfits.forEach(item => brokerSet.add(item.broker));
        }

        return {
            symbol: variety.symbol,
            profits: profitByRange,
            brokers: [...brokerSet],
        };
    }

    async collectProfitData(rangeMap, options = {}) {
        const varietiesList = options.varietiesList || VARIETIES_LIST;
        const entries = await mapWithConcurrency(
            varietiesList,
            async (variety) => {
                console.log(`🚀🚀正在获取${variety.name}盈亏数据...`);

                const rangeEntries = await Promise.all(
                    Object.entries(rangeMap).map(async ([rangeType, dates]) => {
                        const data = await this.fetchVarietyProfitData(variety.name, dates);
                        return [rangeType, data];
                    })
                );

                return this.buildProfitEntry(variety, Object.fromEntries(rangeEntries));
            },
            {
                concurrency: this.concurrency,
                delayMs: this.delayMs,
                onProgress: createProgressLogger("盈亏数据", {
                    every: this.progressEvery,
                }),
            }
        );

        return entries.reduce((result, entry) => {
            result.profits[entry.symbol] = entry.profits;
            result.typicalBroker[entry.symbol] = entry.brokers;
            return result;
        }, {
            profits: {},
            typicalBroker: {},
        });
    }

    async saveData(profits, typicalBroker) {
        await fs.writeFile(this.appOutPath, JSON.stringify(profits), "utf-8");

        const typicalBrokerContent = `const typicalBroker = ${JSON.stringify(typicalBroker, null, 4)};
module.exports = typicalBroker;
`;
        await fs.writeFile(this.serverOutpath, typicalBrokerContent, "utf-8");

        console.log("💯💯盈亏数据更新成功✅！");
    }

    async run(options = {}) {
        const today = options.today ? moment(options.today) : moment();
        const rangeMap = {
            year: [
                today.clone().subtract(1, "year").format("YYYY-MM-DD"),
                today.format("YYYY-MM-DD"),
            ],
            half_year: [
                today.clone().subtract(6, "months").format("YYYY-MM-DD"),
                today.format("YYYY-MM-DD"),
            ],
        };

        const result = await this.collectProfitData(rangeMap, {
            varietiesList: options.varietiesList,
        });
        await this.saveData(result.profits, result.typicalBroker);

        return result;
    }
}

module.exports = VarietyProfitTask;

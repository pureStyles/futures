const { queryBrokerStructure } = require("../api/broker");

const path = require("path");
const fs = require("fs").promises;

const typicalBrokerConfig = require("../config/typicalBroker");
const { createProgressLogger, mapWithConcurrency } = require("../utils/task.js");
const { DEFAULT_TASK_OPTIONS } = require("./config.js");

class BrokerStructureTask {
    constructor(options = {}) {
        this.outPath = path.join(process.cwd(), "app", "public/data/brokerStructure.json");
        this.concurrency = options.concurrency || DEFAULT_TASK_OPTIONS.concurrency;
        this.delayMs = options.delayMs || DEFAULT_TASK_OPTIONS.delayMs;
        this.progressEvery = options.progressEvery || DEFAULT_TASK_OPTIONS.progressEvery;
    }

    async fetchBrokerStructure(broker) {
        const res = await queryBrokerStructure({
            broker,
            family: "all",
        });

        res.data[0].shift();
        const varietyStructure = res.data.reduce((pre, cur, index) => {
            if (index === 0) {
                return pre;
            }
            pre[cur[0]] = cur.slice(-22);
            return pre;
        }, {});

        return {
            dates: res.data[0].slice(-22),
            value: varietyStructure,
        };
    }

    async writeFile(object) {
        await fs.writeFile(this.outPath, JSON.stringify(object), "utf-8");
    }

    getUniqueBrokers(typicalBrokerMap) {
        return [...new Set(Object.values(typicalBrokerMap).flat())];
    }

    async execute(options = {}) {
        const typicalBrokerMap = options.typicalBrokerMap || typicalBrokerConfig;
        const brokers = this.getUniqueBrokers(typicalBrokerMap);
        const brokerStructure = {};

        const results = await mapWithConcurrency(
            brokers,
            async (broker) => {
                console.log(`⏩正在查询${broker}的持仓结构`);
                const result = await this.fetchBrokerStructure(broker);
                return {
                    broker,
                    result,
                };
            },
            {
                concurrency: this.concurrency,
                delayMs: this.delayMs,
                onProgress: createProgressLogger("席位结构", {
                    every: this.progressEvery,
                }),
            }
        );

        for (const { broker, result } of results) {
            brokerStructure.dates = result.dates;
            brokerStructure[broker] = result.value;
        }

        console.log("✅查询完毕");
        await this.writeFile(brokerStructure);
    }
}

module.exports = BrokerStructureTask;

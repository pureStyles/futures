const path = require("path");
const fs = require("fs").promises;

const { queryMainVarieies } = require("../api/variety.js");
const { VARIETIES_LIST } = require("../config/index.js");
const { createProgressLogger, mapWithConcurrency } = require("../utils/task.js");
const { DEFAULT_TASK_OPTIONS } = require("./config.js");

class MainContractsTask {
    constructor(options = {}) {
        this.outpath1 = path.join(process.cwd(), "app", "src/config/varieties.js");
        this.outpath2 = path.join(process.cwd(), "server", "config/variety.js");
        this.concurrency = options.concurrency || DEFAULT_TASK_OPTIONS.concurrency;
        this.delayMs = options.delayMs || DEFAULT_TASK_OPTIONS.delayMs;
        this.progressEvery = options.progressEvery || DEFAULT_TASK_OPTIONS.progressEvery;
    }

    async fetchRecentContracts(name, date) {
        const data = await queryMainVarieies({
            variety: name,
            date,
        });
        return data;
    }

    async collectMainContracts(date) {
        return mapWithConcurrency(
            VARIETIES_LIST,
            async (variety) => {
                console.log(`🟦正在查询${variety.name}的主力合约数据...`);
                const contracts = await this.fetchRecentContracts(variety.name, date);
                return {
                    name: variety.name,
                    symbol: variety.symbol,
                    mainVariety: (contracts || []).slice(0, 2).map(item => item.code),
                };
            },
            {
                concurrency: this.concurrency,
                delayMs: this.delayMs,
                onProgress: createProgressLogger("主力合约", {
                    every: this.progressEvery,
                }),
            }
        );
    }

    async saveData(mainContracts) {
        const listString = JSON.stringify(mainContracts, null, 4);
        const webContent = `export const VARIETIES_LIST = ${listString};`;
        const serverContent = `const VARIETIES_LIST = ${listString};
module.exports = {
    VARIETIES_LIST
};
`;

        await fs.writeFile(this.outpath1, webContent, "utf-8");
        await fs.writeFile(this.outpath2, serverContent, "utf-8");

        console.log("合约主力刷新成功✅！");
    }

    async run(options = {}) {
        const { date, persist = true } = typeof options === "string"
            ? { date: options, persist: true }
            : options;

        const mainContracts = await this.collectMainContracts(date);
        console.log("✅合约主力数据查询完成");

        if (persist) {
            await this.saveData(mainContracts);
        }

        return mainContracts;
    }
}

module.exports = MainContractsTask;

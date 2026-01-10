const path = require('path');
const fs = require('fs').promises;
const moment = require("moment");

const { queryVarietyProfit } = require("../api/variety.js");

const { VARIETIES_LIST } = require("../config/index");

class varietyProfit {
    profits = {};
    typicalBroker = {};
    appOutPath = path.join(process.cwd(), 'app', `public/data/profit.json`);
    serverOutpath = path.join(process.cwd(), 'server', 'config/typicalBroker.js');

    async fetchVarietyProfitData(name, dates) {
        try {
            const data = await queryVarietyProfit({
                variety: name,
                date1: dates[0],
                date2: dates[1],
            });
            return data;
        } catch (error) {
            console.log(error)
        }
    }

    async collectRangeData(dates, type) {
        for(const variety of VARIETIES_LIST) {
            console.log(`🚀🚀正在获取${variety.name}盈亏数据...`);
            const data = await this.fetchVarietyProfitData(variety.name, dates);
            const { brokers, value } = data || {};
            const profits = (brokers || []).map((name, index) => {
                return {
                    broker: name,
                    value: value[index] || 0,
                }
            });
            /** 盈亏数据从大到小排序 */
            const sortedProfits = [... profits].sort((a, b) => b.value - a.value);
            const winers = sortedProfits.slice(0, 6).filter(item => item.value > 0);
            const losers = sortedProfits.slice(-6).filter(item => item.value < 0);
            const _profits = [...winers, ...losers];

            if (!this.profits[variety.symbol]) {
                this.profits[variety.symbol] = {};
            }
            if (!this.typicalBroker[variety.symbol]) {
                this.typicalBroker[variety.symbol] = [];
            }
            this.profits[variety.symbol][type] = _profits;
            const typicalBroker = _profits.filter(e => !this.typicalBroker[variety.symbol].includes(e.broker)).map(e => e.broker);
            this.typicalBroker[variety.symbol].push(...typicalBroker);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async saveData() {
        await fs.writeFile(
            this.appOutPath,
            JSON.stringify(this.profits),
            'utf-8'
        )

        const typicalBrokerBrokerStr = JSON.stringify(this.typicalBroker, null, 4);
        const nodeContent = `
            const typicalBroker = ${typicalBrokerBrokerStr};
            module.exports = typicalBroker;
        `
        await fs.writeFile(
            this.serverOutpath,
            nodeContent,
            'utf-8'
        )
        console.log("💯💯盈数据更新成功✅！");
    }

    async run() {
        const today = moment();
        const oneYearAgo = today.clone().subtract(1, 'year').format('YYYY-MM-DD');
        const halfYearAgo = today.clone().subtract(6, 'months').format('YYYY-MM-DD');
        const todayStr = today.format('YYYY-MM-DD');

        await this.collectRangeData([oneYearAgo, todayStr], 'year');
        await this.collectRangeData([halfYearAgo, todayStr], 'half_year');
        await this.saveData();

        return this.profits;
    }
}

// new varietyProfit().run();
module.exports = varietyProfit;
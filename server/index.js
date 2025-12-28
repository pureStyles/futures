
const path = require('path');
const fs = require('fs').promises;
const moment = require("moment");
const { fetchVarietyPositionData } = require("./variety/position.js");
const { fetchVarietyProfitData } = require("./variety/profit.js");

const { MAIN_VARIERY, ALL_VARIETIES } = require("./config/index");

const { getNearestWeekday } = require("./utils/date.js");

const DATA_OUTPUT_PATH = path.join(__dirname, `../app/public/data/variety.json`);

class PositionTask {
    positonsData = {};

    async collectData() {
        /** 收集商品维度的持仓数据 */
        for (const mainVarieties of Object.values(MAIN_VARIERY)) {
            for (const varietyCode of mainVarieties) {
                try {
                    const data = await fetchVarietyPositionData(varietyCode);
                    this.positonsData[varietyCode] = data;
                } catch (error) {
                    console.log(error);
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    async loadData(file) {
        try {
          const raw = await fs.readFile(file, 'utf-8')
          return JSON.parse(raw);
        } catch {
          return []
        }
    }

    appendByDate(list, day) {
        const index = list.findIndex(d => d.date === day.date);
        if (index >= 0) {
          list[index] = day
        } else {
          list.push(day)
        }
    }
    
    async saveData () {
        const store = await this.loadData(DATA_OUTPUT_PATH);
        this.appendByDate(store, {
            date: getNearestWeekday(),
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            positions: this.positonsData
        });

        await fs.writeFile(
            DATA_OUTPUT_PATH,
            JSON.stringify(store, null, 2),
            'utf-8'
        )
    }

    async run() {
        await this.collectData();
        await this.saveData();
    }
}

// new PositionTask().run();

/** 盈亏数据收集
 * 收集后的数据结构：[{ broker: '国泰君安', value: -55643980'}]
*/
class ProfitTask {
    profits = {};
    outpath = path.join(__dirname, `../app/public/data/profit.json`);

    async collectOneDayData(dates, type) {
        for(const variety of ALL_VARIETIES) {
            const data = await fetchVarietyProfitData(variety.name, dates);
            const { brokers, value } = data || {};
            const profits = (brokers || []).map((name, index) => {
                return {
                    broker: name,
                    value: value[index] || 0,
                }
            });
            if (!this.profits[variety.symbol]) {
                this.profits[variety.symbol] = {};
            }
            this.profits[variety.symbol][type] = profits;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async saveData() {
        await fs.writeFile(
            this.outpath,
            JSON.stringify(this.profits),
            'utf-8'
        )
        console.log("盈亏数据更新成功✅！");
    }

    async run() {
        const today = moment();
        const oneYearAgo = today.clone().subtract(1, 'year').format('YYYY-MM-DD');
        const halfYearAgo = today.clone().subtract(6, 'months').format('YYYY-MM-DD');
        const todayStr = today.format('YYYY-MM-DD');

        await this.collectOneDayData([oneYearAgo, todayStr], 'year');
        await this.collectOneDayData([halfYearAgo, todayStr], 'half_year');
        await this.saveData();
    }

}

new ProfitTask().run();
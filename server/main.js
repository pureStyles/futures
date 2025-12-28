const path = require('path');
const fs = require('fs').promises;
const moment = require("moment");
const { fetchVarietyPositionData } = require("./variety/position.js");
const { MAIN_VARIERY } = require("./config/index");
const { getNearestWeekday } = require("./utils/date.js");

const DATA_OUTPUT_PATH = path.join(__dirname, `../app/public/data/variety.json`);

class Task {
    // 存储结构改为：{ "2025-12-01": { positionsData }, ... }
    dailyStore = {};

    async collectOneDayData(dateStr) {
        console.log(`开始抓取 [${dateStr}] 的数据...`);
        const dayPositions = {};
        
        for (const mainVarieties of Object.values(MAIN_VARIERY)) {
            for (const varietyCode of mainVarieties) {
                try {
                    // 传入循环中的具体日期 dateStr
                    const data = await fetchVarietyPositionData(varietyCode, dateStr);
                    if (data && Object.keys(data).length > 0) {
                        dayPositions[varietyCode] = data;
                    }
                } catch (error) {
                    // 如果某天没数据（如节假日），通常会报错，这里记录日志即可
                    console.log(`[${dateStr}] ${varietyCode} 抓取失败或无数据`);
                }
                // 频率限制
                await new Promise(resolve => setTimeout(resolve, 800));
            }
        }
        return dayPositions;
    }

    async collectLastMonth() {
        const daysToFetch = 30; // 抓取最近30天
        for (let i = 0; i < daysToFetch; i++) {
            const currentDay = moment().subtract(i, 'days');
            
            // 跳过周末 (0是周日，6是周六)
            if (currentDay.day() === 0 || currentDay.day() === 6) {
                continue;
            }

            const dateStr = currentDay.format('YYYY-MM-DD');
            const data = await this.collectOneDayData(dateStr);

            if (Object.keys(data).length > 0) {
                this.dailyStore[dateStr] = data;
            }
        }
    }

    async loadData(file) {
        try {
            const raw = await fs.readFile(file, 'utf-8');
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    appendByDate(list, dateStr, positionsData) {
        const index = list.findIndex(d => d.date === dateStr);
        const dayEntry = {
            date: dateStr,
            updated_at: moment().format('YYYY-MM-DD HH:mm:ss'),
            positions: positionsData
        };

        if (index >= 0) {
            list[index] = dayEntry;
        } else {
            list.push(dayEntry);
        }
    }

    async saveData() {
        let store = await this.loadData(DATA_OUTPUT_PATH);

        // 将本次抓取的每一天数据存入 store
        for (const [dateStr, posData] of Object.entries(this.dailyStore)) {
            this.appendByDate(store, dateStr, posData);
        }

        // 按日期从小到大排序，方便前端图表展示
        store.sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

        await fs.writeFile(
            DATA_OUTPUT_PATH,
            JSON.stringify(store, null, 2),
            'utf-8'
        );
        console.log("全量数据保存成功！");
    }

    async run() {
        console.log("开始执行一个月历史数据抓取任务...");
        await this.collectLastMonth();
        await this.saveData();
    }
}

new Task().run();
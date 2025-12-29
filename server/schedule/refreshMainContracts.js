/**
 * 刷新主力合约数据
 */

const path = require('path');
const fs = require('fs').promises;

const { queryMainVarieies } = require("../api/variety.js");
const { ALL_VARIETIES } = require("../config/index.js");


module.exports = class  {
    mainContracts = [];
    outpath = path.join(__dirname, "../../app/src/config/_variety.json");

    async fetchRecentContracts(name) {
        try {
            const data = await queryMainVarieies({
                variety: name,
                date: undefined,
            });
            return data;
        } catch (error) {
            console.log(error)
            process.exit(1);
        }
    }

    async saveData() {
        await fs.writeFile(
            this.outpath,
            JSON.stringify(this.mainContracts, null, 2),
            'utf-8'
        )
        console.log("合约主力刷新成功✅！");
    }

    async run() {
        for(const variety of ALL_VARIETIES) {
            console.log(`🟦正在查询${variety.name}的主里合约数据...`)
            const contracts = await this.fetchRecentContracts(variety.name);
            /** 选择前两个作为主力合约 */
            this.mainContracts.push({
                name: variety.name,
                symbol: variety.symbol,
                mainVariety: (contracts || []).slice(0, 2).map(e => e.code)
            });
            /** 等待一秒再调接口获取下一个主力/次主力合约 */
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`✅合约主力数据查询完成`);

        this.saveData();
    }
}
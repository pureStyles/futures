/**
 * 刷新主力合约数据
 */

const path = require('path');
const fs = require('fs').promises;

const { queryMainVarieies } = require("../api/variety.js");
const { VARIETIES_LIST } = require("../config/index.js");


module.exports = class  {
    mainContracts = [];
    outpath1 = path.join(process.cwd(), "app", "src/config/varieties.js");
    outpath2 = path.join(process.cwd(), "server", "config/variety.js");

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
        // 1. 先将数据对象转换为标准的 JSON 字符串格式
        const listString = JSON.stringify(this.mainContracts, null, 4);
    
        // 2. 构造代码字符串，注意这里不需要对整个 fileContent 使用 JSON.stringify
        const fileContent = `export const VARIETIES_LIST = ${listString};`;
        const nodeContent = `const VARIETIES_LIST = ${listString};
            module.exports = {
                VARIETIES_LIST
            }
        `
    
        await fs.writeFile(
            this.outpath1,
            fileContent,
            'utf-8'
        );

        await fs.writeFile(
            this.outpath2,
            nodeContent,
            'utf-8'
        );


        
        console.log("合约主力刷新成功✅！");
    }

    async run() {
        for(const variety of VARIETIES_LIST) {
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
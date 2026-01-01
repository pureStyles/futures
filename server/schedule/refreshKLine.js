/**
 * 更新K线数据，更好的观察形态与净持仓的关系
 * K线的主体：主力合约
 */

const path = require('path');
const fs = require('fs').promises;

const { VARIETIES_LIST } = require('../config/variety');

const { queryK } = require('../api/K');
const { C } = require('../config/positveBroker');

class K {
    constructor() {
        this.errorInfo = {
            request: [],
        };

        this.outPath = path.join(process.cwd(), 'app', 'public/data/k.json');
    }

    async fetchKData(varietyName) {
        try {
            const data = await queryK({
                brokers: ['国泰君安'],
                variety: varietyName,
            });
            const { dates, infos } = data;
            return {
                dates: dates.slice(-22),
                infos: infos.slice(-22),
            };
        } catch (error) {
            this.errorInfo.request.push({ varietyName, error});
        }
    }

    async saveData(Object) {
        await fs.writeFile(
            this.outPath,
            JSON.stringify(Object),
            'utf-8'
        );
    }

    async execute() {
        const allVarietiesK = { };
        for(const variety of VARIETIES_LIST) {
            console.log(`⚙️正在获取${variety.name}合约的K线数据...`);
            allVarietiesK[variety.symbol]= await this.fetchKData(variety.name);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.saveData(allVarietiesK);

        console.log("💯K线数据完成更新");
        console.log('错误信息', JSON.stringify(this.errorInfo));
    }
}

new K().execute();

module.exports = K;
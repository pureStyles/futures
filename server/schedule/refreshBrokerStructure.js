const { queryBrokerStructure } = require('../api/broker');

const typicalBroker = require('../config/typicalBroker');


const path = require('path');
const fs = require('fs').promises;

class Structure {
    
    constructor() {
        this.outPath = path.join(process.cwd(), 'app', 'public/data/brokerStructure.json');
    }

    async fetchBrokerStructure(broker) {
        const res = await queryBrokerStructure({
            broker,
            family: 'all'
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
            /** 只需要一部分数据 */
            dates: res.data[0].slice(-22),
            value: varietyStructure,
        }
    }

    async writeFile(object) {
        const json = JSON.stringify(object);

        fs.writeFile(
            this.outPath,
            json,
            'utf-8'
        )
    }

    async execute() {
        /**
         * 数据结构如下
         * { dates: [], 国泰君安: { 沪深300: [a, b, c, ..., f]} }
         */
        const brokerStructure = { };
        for(const brokers of Object.values(typicalBroker)) {
            for(const broker of brokers ) {
                console.log(`⏩正在查询${broker}的持仓结构`);
                const result = await this.fetchBrokerStructure(broker);
                brokerStructure.dates  = result.dates;
                brokerStructure[broker] = result.value;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log(`✅查询完毕`);

        await this.writeFile(brokerStructure);
    }
}

new Structure().execute();

module.exports = Structure;
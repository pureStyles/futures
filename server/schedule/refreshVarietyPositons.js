
/** 更新今日合约的持仓数据
 * 更新频次： 一天一次
 * 注意：为解决空间，增加一天的同时，需要删除一天
 */

const path = require('path');
const fs = require('fs').promises;

const exchangeDays = require("../config/exChangeDay.js");
const { queryVarietyPostion } = require("../api/variety.js");
const typicalBroker = require("../config/typicalBroker.js");
const { VARIETIES_LIST } = require("../config/index.js");


class PositionTask {
    constructor() {
        /** 用来收集错误信息，校验数据的完整性 */
        this.errorInfo = {
            /** 接口请求失败 */
            request: [],
            /** 加载历史数据失败 */
            readFile: false,
        };
        this.outPath = path.join(process.cwd(), 'app', `public/data/position.json`)
        /**
         * positionData的数据结构
         * { CF2605: { longPostion: [ {broker: '国泰君安', buy: 233 }, {}]}}
         */
    }

    async fetchVarietyPositionData(params, variety) {
        const { symbol } = variety || {};
        try {
            const data = await queryVarietyPostion(params);
            return {
                longPosition: (data.buy || []).filter(e => typicalBroker[symbol].includes(e.broker)),
                shortPosition: (data.ss || []).filter(e => typicalBroker[symbol].includes(e.broker)),
            }
        } catch (error) {
            this.errorInfo['request'].push({
                date: params.date,
                variety: variety.name,
                code: variety.code
            });
            console.log(error)
        }
    }

    /** 获取某一天的持仓详情数据 */
    async collectData(date) {
        const varietyPosition = {};
        /** 收集商品维度的持仓数据 */
        for (const variety of VARIETIES_LIST) {
            for (const contract of ['all', ...variety.mainVariety]) {
                console.log(`\n🎸正在获取${variety.name}${contract}的持仓详情...`);
                try {
                    const data = await this.fetchVarietyPositionData({
                        variety: variety.name,
                        code: contract,
                        date,
                    }, variety);
                    if (!varietyPosition[variety.symbol]) {
                        varietyPosition[variety.symbol] = {};
                    }
                    varietyPosition[variety.symbol][contract] = data;
                } catch (error) {
                    console.log(error);
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return varietyPosition;
    }

    /**
     * 收集指定交易日的数据
     */
    async collectDatesData(dates) {
        let dateRangeContractsPosition = [];
        for(let i = 0; i < dates.length; i++) {
            const progress = ((i + 1) / dates.length * 100).toFixed(1);
            process.stdout.write(`\r🔄 历史数据获取进度: ${i + 1}/${dates.length} (${progress}%)`);

            const dateStr = dates[i];
            /** 这一天下所有的合约持仓详情 */
            const contratsPosition = await this.collectData(dateStr);
            dateRangeContractsPosition.push({
                date: dateStr,
                positions: contratsPosition,
            });
        }
        return dateRangeContractsPosition || [];
    }

    async loadData(file) {
        try { 
          const raw = await fs.readFile(file, 'utf-8')
          return JSON.parse(raw);
        } catch {
            this.errorInfo['readFile'] = true;
            return [];
        }
    }

    /**
     * 更新历史数据，一般只需要执行一次即可
     */
    async updateLast30DaysPosition()  {
        const positions = await this.collectDatesData(exchangeDays);
        await fs.writeFile(
            this.outPath,
            JSON.stringify(positions),
            'utf-8'
        );
        console.log('💯💯历史数据更新成功')
    }


    /** 更新最新一个交易日的持仓详情
     * 适用于在有历史数据的基础上新增数据
     */
    async updateNearPosition(date) {
        const currentData = await this.loadData(this.outPath);
        const positions = await this.collectData(date);
        /** 删除一个交易日的数据后再添加一个交易日数据 */
        currentData.shift();
        currentData.push({
            date,
            positions: positions
        });

        await fs.writeFile(
            this.outPath,
            JSON.stringify(currentData),
            'utf-8'
        );
    }
}

module.exports = PositionTask;

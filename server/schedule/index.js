const moment = require("moment");
const path = require('path');
const fs = require('fs').promises;

const MainContracts = require("./refreshMainContracts.js");
const VarietyPositions = require("./refreshVarietyPositons.js");
const BrokerStructure  = require('./refreshBrokerStructure.js');
const VarietyProfits = require("./updateVarietyProfits.js");

const exchangeDays = require("../config/exChangeDay.js");



/** 定时任务执行顺序
 * first: 每天获取合约、以及对应的主力合约、次主力合约，这些数据是后续分析的基础数据
 * second: 根据获取的合约，获取各个席位在这个合约上的盈亏数据，根据数据分析出”常胜席位“
 * third: 查询”常胜席位“在这些合约汇总、主力合约、次主力合约上的持仓数据，并且写入json文件
*/

/** 任务执行入口 */
async function main() {
    console.log('now', moment().format("YYYY-MM-DD HH:mm:ss"))
    const today = moment().format("YYYY-MM-DD");
    if(!exchangeDays.includes(today)) {
        /** 如果不是交易日就不用更新 */
        console.log(`\r🔄 今日不是交易日，无需更新数据`);
        process.exit(1);
    }
    /** 在现有数据的基础上，需要连续 */

    const positionPath = path.join(process.cwd(), 'app', 'public/data/position.json');
    const positionRaw = await fs.readFile(positionPath);
    const positionData = JSON.parse(positionRaw);
    const curIndex = exchangeDays.findIndex(date => date === positionData[positionData.length - 1].date);
    if (curIndex < 0) {
        console.log('历史数据不对');
        process.exit(1);
    }
    if (exchangeDays[curIndex + 1] !== today) {
        console.log('❌数据不连续，请检查');
        process.exit(1);
    }
    /** 需要等到收盘后才会有数据，定在本地17:30 */
    const now = moment();
    const readyTime = now.clone().hour(9).minute(30).second(0).millisecond(0);
    if (now < readyTime.valueOf()) {
        /** 数据还没准备好 */
        process.stdout.write(`\r🔄 还没到更新时间`);
        process.exit(1);
    }

    /** 交易日需要更新数据
     * 1. 需要刷新合约主力数据
     * 2. 需要获取商品下重要合约的持仓详情数据
     */

    /** 1. 刷新合约主力数据 */
    await new MainContracts().run();

    /** 2 跟新盈亏数据 */
    await new VarietyProfits().run();

    /** 3. 获取感兴趣商品持仓详情
     * 中包括主力合约、次主力合约、合约汇总数据的持仓详情（只写入盈亏靠前的席位持仓） 
    */
   const varietyPositions = new VarietyPositions();
   await varietyPositions.updateNearPosition(today);
   const { request } = varietyPositions.errorInfo;
   if (request && request.length) {
    console.warn(`⚠️有接口请求失败了，需要补充数据完整性`, JSON.stringify(request));
   }

   new BrokerStructure().execute();
}

main();


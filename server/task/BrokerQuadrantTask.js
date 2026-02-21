const moment = require('moment');
const path = require('path');
const fs = require('fs').promises;
const { queryBrokerPositions, queryBrokerNetValue } = require('../api/broker.js');

const typicalBroker = require('../config/typicalBroker.js');
const correlationGroups  = require('../config/correlation.js');

class BrokerQuadrantTask {
    constructor() {
        // 输出路径，对接前端 fetch 路径
        this.outPath = path.join(process.cwd(), 'app', 'public/data/brokerQuadrant.json');

        /**
         * 重点监控的席位列表
         */
        this.targetBrokers = [...new Set(Object.values(typicalBroker).flat())];
    }

    /**
     * 执行任务主入口
     */
    async execute() {
        console.log("🚀 开始生成席位持仓四象限数据...");
        // const date = moment().format('YYYY-MM-DD');
        const date = "2026-02-13"; // 固定日期，方便调试和对比
        const finalResults = {};

        try {
            for (const broker of this.targetBrokers) {
                console.log(`📊 正在抓取席位数据: ${broker}`);

                // 1. 获取席位各合约详细持仓 (接口 1)
                // 入参示例: { date: '2026-02-13', broker: '国泰君安' }
                const posRes = await queryBrokerPositions({ date, broker });

                // 2. 获取席位市值结构表 (接口 2)
                // 入参示例: { page: 1, limit: 100, broker: '国泰君安', family: 'all' }
                const structRes = await queryBrokerNetValue({ 
                    page: 1, 
                    limit: 100, 
                    broker: broker, 
                    family: 'all' 
                });


                // 处理该席位下的所有品种集群
                const brokerQuadrantData = this.calculateBrokerGroups(
                    posRes.positions, 
                    structRes
                );

                if (brokerQuadrantData.length > 0) {
                    finalResults[broker] = brokerQuadrantData;
                }
            }

            // 3. 写入文件
            const output = {
                updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                data: finalResults
            };

            const dir = path.dirname(this.outPath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(this.outPath, JSON.stringify(output, null, 4), 'utf-8');

            console.log(`✅ 四象限数据已成功同步至: ${this.outPath}`);
        } catch (error) {
            console.error("❌ 任务运行失败:", error.message);
        }
    }

    /**
     * 核心计算逻辑
     * @param {Object} posMap 接口1返回的品种持仓对象
     * @param {Array} structList 接口2返回的市值数据数组
     */
    calculateBrokerGroups(posMap, structList) {
        const processedGroups = [];

        for (const [groupName, varieties] of Object.entries(correlationGroups)) {
            let totalBuy = 0;
            let totalSS = 0;
            let groupNetValue = 0;

            varieties.forEach(vName => {
                // A. 处理多空单量 (来自接口1)
                // 接口返回的品种名可能是 Unicode 或特定简称，请确保匹配
                if (posMap[vName]) {
                    posMap[vName].forEach(contract => {
                        totalBuy += (contract.buy || 0);
                        totalSS += (contract.ss || 0);
                    });
                }

                // B. 处理净持仓市值 (来自接口2)
                const struct = structList.find(s => s.name === vName);
                if (struct) {
                    groupNetValue += (struct.net_value || 0);
                }
            });

            // 只有当该集群有持仓时才记录
            if (totalBuy + totalSS > 0) {
                /**
                 * 横坐标 (X): 多头占比
                 * 公式: [多单 / (多单 + 空单)] * 100
                 * 结果范围: 0 - 100, 50 为多空平衡点
                 */
                const x = (totalBuy / (totalBuy + totalSS)) * 100;

                /**
                 * 纵坐标 (Y): 净持仓市值
                 * 气泡大小 (Size): 市值的绝对值（反映仓位规模）
                 */
                processedGroups.push({
                    name: groupName,
                    x: parseFloat(x.toFixed(2)),
                    y: groupNetValue,
                    size: Math.abs(groupNetValue),
                    details: {
                        buy: totalBuy,
                        ss: totalSS,
                        varieties: varieties
                    }
                });
            }
        }

        return processedGroups;
    }
}

module.exports = BrokerQuadrantTask;

// 脚本直接运行支持
if (require.main === module) {
    new BrokerQuadrantTask().execute();
}
const moment = require('moment');
const path = require('path');
const fs = require('fs').promises;
const { queryVarietyCorrelation } = require('../api/variety.js');

class CorrelationTask {
    constructor() {
        // 输出路径保持与你的项目结构一致
        this.outPath = path.join(process.cwd(), 'app', 'src/config/correlationData.js');
        
        // 品种列表：建议涵盖主要能化、黑色、农产品板块，方便分析相关性
        this.varieties = [
            "低硫油", "原油", "燃料油", "沥青", "LPG", 
            "螺纹钢", "铁矿石", "热卷", "焦炭", "焦煤",
            "甲醇", "纯碱", "玻璃", "尿素", "白糖"
        ];
    }

    /**
     * 获取数据逻辑：利用你改造后的 queryVarietyCorrelation
     */
    async fetchData() {
        // 使用 moment 处理日期，更符合你的习惯
        const end = moment().format('YYYY-MM-DD');
        const start = moment().subtract(1, 'years').format('YYYY-MM-DD');

        try {
            const params = {
                start,
                end,
                varieties: this.varieties.join(',')
            };

            const res = await queryVarietyCorrelation(params);
            return res.data;
        } catch (error) {
            console.error("抓取相关性数据失败:", error.message);
            return null;
        }
    }

    /**
     * 数据清洗：将原始矩阵转换为 ECharts 友好的格式
     */
    processData(data) {
        if (!data || !data.correlation) return null;

        const cleanedCorrelation = data.correlation.map(item => {
            // item 结构: [xAxisIndex, yAxisIndex, value]
            let val = item[2];
            
            // 相同品种相交显示为 "-"，在热力图中处理为 100 (满相关)
            // 同时也兼容处理可能出现的 null 或非数字情况
            if (val === '-') {
                val = 100;
            } else if (typeof val === 'string') {
                val = parseFloat(val);
            }

            return [item[0], item[1], val];
        });

        return {
            varieties: data.varieties,
            correlation: cleanedCorrelation,
            updateTime: moment().format('YYYY-MM-DD HH:mm:ss')
        };
    }

    async execute() {
        console.log("🚀 开始采集品种相关性数据...");
        const rawData = await this.fetchData();

        if (!rawData) {
            console.error("❌ 采集失败，停止写入文件。");
            return;
        }

        const finalData = this.processData(rawData);

        const jsContent = `/** 自动生成的相关性分析数据 */\n` +
                          `export const CORRELATION_DATA = ${JSON.stringify(finalData, null, 4)};`;

        try {
            // 确保目录存在（防止初次运行报错）
            const dir = path.dirname(this.outPath);
            await fs.mkdir(dir, { recursive: true });
            
            await fs.writeFile(this.outPath, jsContent, 'utf-8');
            console.log(`✅ 相关性数据已成功同步至: ${this.outPath}`);
        } catch (err) {
            console.error("写入文件失败:", err);
        }
    }
}

// 导出类以便在主控脚本中使用
module.exports = CorrelationTask;

// 脚本直接运行时执行
if (require.main === module) {
    new CorrelationTask().execute();
}
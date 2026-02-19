const moment = require('moment');
const path = require('path');
const fs = require('fs').promises;
const { queryVarietyCorrelation } = require('../api/variety.js');
const { VARIETIES_LIST } = require('../config/variety.js');

class CorrelationTask {
    constructor() {
        // 输出到 public 供前端 fetch
        this.outPath = path.join(process.cwd(), 'app', 'public/data/correlationData.json');
        
        // 板块定义：根据你的需求分类
        // 这里会自动匹配 VARIETIES_LIST 中的品种
        this.sectorConfig = {
            "贵金属": ["沪金", "沪银"],
            "有色金属": ["沪铜", "沪铝", "沪锌", "沪铅", "沪镍", "沪锡"],
            "股指": ["300沪深", "50上证", "500中证", "1000中证"],
            "其他": [] // 剩余品种会自动填充到这里
        };
    }

    async fetchData() {
        const end = moment().format('YYYY-MM-DD');
        const start = moment().subtract(1, 'years').format('YYYY-MM-DD');

        try {
            // 获取全部品种名称
            const allNames = VARIETIES_LIST.map(v => v.name).concat(['燃料油', '原油', '低硫油']);
            const params = {
                start,
                end,
                varieties: allNames.join(',')
            };

            const res = await queryVarietyCorrelation(params);
            return res;
        } catch (error) {
            console.error("抓取相关性数据失败:", error.message);
            return null;
        }
    }

    /**
     * 核心逻辑：将大矩阵拆分为小板块矩阵
     */
    processSectors(rawData) {
        if (!rawData || !rawData.correlation) return null;

        const { varieties: allNames, correlation: allValues } = rawData;
        
        // 1. 自动归类品种到板块
        const sectorMapping = {
            "贵金属": [],
            "有色金属": [],
            "股指": [],
            "其他": []
        };

        allNames.forEach((name, index) => {
            if (this.sectorConfig["贵金属"].includes(name)) {
                sectorMapping["贵金属"].push({ name, oldIdx: index });
             } else if (this.sectorConfig["有色金属"].includes(name)) {
                 sectorMapping["有色金属"].push({ name, oldIdx: index });
             } else if (this.sectorConfig["股指"].includes(name)) {
                 sectorMapping["股指"].push({ name, oldIdx: index });
             } else {
                 sectorMapping["其他"].push({ name, oldIdx: index });
             }
        });

        const sectorsResult = {};

        // 2. 为每个板块生成独立的矩阵
        Object.keys(sectorMapping).forEach(sectorName => {
            const list = sectorMapping[sectorName];
            const newVarieties = list.map(item => item.name);
            const newCorrelation = [];

            // 双重循环构建该板块内的两两关系
            list.forEach((rowItem, newRowIdx) => {
                list.forEach((colItem, newColIdx) => {
                    if (newRowIdx === newColIdx) {
                        newCorrelation.push([newRowIdx, newColIdx, null]); // 对角线留白
                    } else {
                        // 从大矩阵中寻找对应的原始值
                        const target = allValues.find(v => v[0] === rowItem.oldIdx && v[1] === colItem.oldIdx);
                        let val = target ? target[2] : null;
                        
                        // 清洗数据
                        if (val === '-') val = null;
                        else if (typeof val === 'string') val = parseFloat(val);
                        
                        newCorrelation.push([newRowIdx, newColIdx, val]);
                    }
                });
            });

            sectorsResult[sectorName] = {
                varieties: newVarieties,
                correlation: newCorrelation
            };
        });

        return {
            sectors: sectorsResult,
            updateTime: moment().format('YYYY-MM-DD HH:mm:ss')
        };
    }

    async execute() {
        console.log("🚀 开始采集并按板块分类相关性数据...");
        const rawData = await this.fetchData();

        if (!rawData) {
            console.error("❌ 采集失败。");
            return;
        }

        const finalData = this.processSectors(rawData);

        try {
            const dir = path.dirname(this.outPath);
            await fs.mkdir(dir, { recursive: true });
            
            // 写入 JSON
            await fs.writeFile(this.outPath, JSON.stringify(finalData, null, 4), 'utf-8');
            console.log(`✅ 数据已分类存储至: ${this.outPath}`);
        } catch (err) {
            console.error("写入文件失败:", err);
        }
    }
}

module.exports = CorrelationTask;

if (require.main === module) {
    new CorrelationTask().execute();
}
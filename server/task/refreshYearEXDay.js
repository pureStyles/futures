/** 
 * 写入从今天开始到下一年的交易日
 */

const axios = require("axios");
const moment = require('moment');
const path = require('path');
const fs = require('fs').promises;

class writeExchangeDay {
    constructor() {
        this.outPath = path.join(process.cwd(), 'server', 'config/exChangeDay.js');
        // 定义完整的请求头，模拟浏览器（去掉Cookie）
        this.headers = {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'zh-CN,zh;q=0.9,ar;q=0.8',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'proxy-connection': 'keep-alive',
            'referrerPolicy': 'strict-origin-when-cross-origin',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
        };
    }

    async queryDateInfo(date) {
        try {
            const result = await axios.get(`http://www.sanhulianghua.com:2008/v1/hsa_rili?token=1e68181c9fd27fbb52769b7248789337&date=${date}`, {
                headers: this.headers,
                timeout: 10000,
            });
            const { ret, trade } = result.data || {};
            if (ret !== 200) {
                throw new Error('日期信息查询失败');
            }
            if (trade === 1) {
                /** 1表示交易日*/
                return true;
            }
            return false;

        } catch (error) {
            console.log('❌接口出错', error);
            process.exit(1);
        }
    }

    /**
     * 生成从今天到下一年的所有日期
     * @returns {Array} 日期字符串数组
     */
    generateDateRange() {
        const dates = [];
        const startDate = moment();
        const endDate = moment(startDate).add(1, 'year');
        
        let currentDate = moment(startDate);
        
        while (currentDate.isSameOrBefore(endDate)) {
            dates.push(currentDate.format('YYYY-MM-DD'));
            currentDate.add(1, 'day');
        }
        
        console.log(`📅 生成日期范围: ${dates[0]} 至 ${dates[dates.length - 1]}`);
        console.log(`📊 总天数: ${dates.length}`);
        
        return dates;
    }

    /**
     * 生成过去30个日期返回，补充历史数据
     */
    generateLast30Days() {
        const dates = [];
        const endDate = moment();
        const startDate = moment(endDate).subtract(30, 'day');
        
        let currentDate = moment(startDate);
        
        while (currentDate.isSameOrBefore(endDate)) {
            dates.push(currentDate.format('YYYY-MM-DD'));
            currentDate.add(1, 'day');
        }
        return dates;
    }

        /**
     * 批量查询工作日
     * @param {Array} dates - 日期数组
     * @returns {Promise<Array>} 工作日数组
     */
    async batchQueryWorkdays(dates) {
        const workdays = [];
        
        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            
            // 显示进度
            const progress = ((i + 1) / dates.length * 100).toFixed(1);
            process.stdout.write(`\r🔄 查询进度: ${i + 1}/${dates.length} (${progress}%)`);
            
            const isWorkday = await this.queryDateInfo(date);
            
            if (isWorkday) {
                workdays.push(date);
            }

            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        console.log('\n✅ 查询完成！');
        return workdays;
    }

      /**
     * 写入工作日到文件
     * @param {Array} workdays - 工作日数组
     * @param {string} filename - 文件名
     */
      async writeToFile(workdays) {
        try {
            // 格式化JSON，保持数组格式
            const content = JSON.stringify(workdays, null, 2);

            const serverFile = `
                const exchangeDays = ${content};
                module.exports = exchangeDays;
            `
            
            await fs.writeFile(this.outPath, serverFile, 'utf8');
            
        } catch (error) {
            console.error('❌ 写入文件失败:', error.message);
        }
    }

    /**
     * 主执行函数
     * @param {Object} options - 配置选项
     * @param {string} options.filename - 输出文件名
     * @param {boolean} options.verbose - 是否显示详细日志
     */
    async execute() {
        const startTime = Date.now();
        try {
            // 1. 生成日期范围
            // const dates = this.generateDateRange();
            const dates = this.generateLast30Days();
            // 2. 查询工作日
            const workdays = await this.batchQueryWorkdays(dates);
            // 3. 写入文件
            this.writeToFile(workdays);
            
            // 4. 统计信息
            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            
            console.log('\n📈 统计信息:');
            console.log(`耗时: ${duration}秒`);
            
        } catch (error) {
            console.error('❌ 执行失败:', error.message);
        }
    }
}

new writeExchangeDay().execute();
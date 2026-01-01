import { ref, computed } from 'vue';

// --- 全局单例状态 ---
const positionData = ref([]);
const profitData = ref({});
const isLoading = ref(false);
const hasFetched = ref(false);

export function useData() {
  
  // 1. 全局数据请求 (自动去重)
  const fetchData = async (force = false) => {
    if (!force && hasFetched.value) return;
    if (isLoading.value) return;

    isLoading.value = true;
    try {
      // 这里的路径建议根据你的实际部署环境调整
      const [posRes, profitRes] = await Promise.all([
        fetch('./data/position.json'),
        fetch('./data/profit.json')
      ]);
      
      positionData.value = await posRes.json();
      profitData.value = await profitRes.json();
      hasFetched.value = true;
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 2. 绿灯区核心逻辑：名次加权筛选法
   * @param {Ref} varietyCode 品种代码，如 'RB'
   */

  // src/composables/useData.js

const getAnalyzedBrokers = (varietyCode) => {
    return computed(() => {
      const vCode = varietyCode.value;
      console.log('当前计算品种:', varietyCode.value);
      const data = profitData.value[vCode] || {};
      const stats = {};
  
      Object.entries(data).forEach(([range, brokers]) => {
        // 盈利榜 (前6)
        const winners = brokers.slice(0, 6);
        winners.forEach((item, index) => {
          if (!stats[item.broker]) stats[item.broker] = { score: 0, winCount: 0, loseCount: 0, totalVal: 0 };
          stats[item.broker].score += (6 - index);
          stats[item.broker].winCount += 1;
          stats[item.broker].totalVal += item.value;
        });
  
        // 亏损榜 (后6)
        const losers = brokers.slice(-6);
        losers.forEach((item, index) => {
          if (!stats[item.broker]) stats[item.broker] = { score: 0, winCount: 0, loseCount: 0, totalVal: 0 };
          // 亏损评分：名次越靠前(亏得越多)，负分越高
          stats[item.broker].score -= (index + 1); 
          stats[item.broker].loseCount += 1;
          stats[item.broker].totalVal -= Math.abs(item.value);
        });
      });
  
      const allBrokers = Object.entries(stats).map(([name, s]) => ({ name, ...s }));
  
      return {
        // 1. 绿灯区：高权重分，且几乎不进亏损榜
        positive: allBrokers
          .filter(b => b.score > 5 && b.loseCount === 0)
          .sort((a, b) => b.score - a.score).slice(0, 3),
  
        // 2. 黄灯区：两边榜单都进过，或者总分在0附近波动，说明多空分歧巨大
        gray: allBrokers
          .filter(b => b.winCount > 0 && b.loseCount > 0)
          .sort((a, b) => (b.winCount + b.loseCount) - (a.winCount + a.loseCount)).slice(0, 3),
  
        // 3. 红灯区：负分极高，长期稳居亏损榜
        negative: allBrokers
          .filter(b => b.loseCount > b.winCount)
          .sort((a, b) => a.score - b.score).slice(0, 3)
      };
    });
  };

  return {
    positionData,
    profitData,
    isLoading,
    fetchData,
    getAnalyzedBrokers
  };
}
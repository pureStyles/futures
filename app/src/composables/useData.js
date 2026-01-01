import { ref, computed } from 'vue';

// 全局单例数据源
const positionData = ref([]);
const profitData = ref({});
const isLoading = ref(false);
const hasFetched = ref(false); // 标记是否已经请求过

export function useData() {
    
    // 基础请求函数
    const fetchData = async (force = false) => {
        if (!force && hasFetched.value) return;
        if (isLoading.value) return;

        isLoading.value = true;
        try {
            console.log('📡 正在请求全局持仓与盈亏数据...');
            const [posRes, profitRes] = await Promise.all([
                fetch(process.env.BASE_URL + 'data/position.json'),
                fetch(process.env.BASE_URL + 'data/profit.json')
            ]);
            
            positionData.value = await posRes.json();
            profitData.value = await profitRes.json();
            hasFetched.value = true;
        } catch (error) {
            console.error('❌ 全局请求失败:', error);
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * 核心逻辑：根据品种代码计算常胜/盈利席位
     * @param {Ref<string>} varietyCode - 品种代码（如 'RB'）
     */
    const getTopBrokers = (varietyCode) => {
        return computed(() => {
            const data = profitData.value[varietyCode.value] || {};
            const frequencyMap = {};

            // 统计各时段稳居盈利前三的席位
            for (const [timeRange, brokers] of Object.entries(data)) {
                const top3 = brokers.slice(0, 3).filter(item => item.value > 0);
                top3.forEach((item) => {
                    if (!frequencyMap[item.broker]) {
                        frequencyMap[item.broker] = { total: 0, count: 0 };
                    }
                    frequencyMap[item.broker].total += item.value;
                    frequencyMap[item.broker].count += 1;
                });
            }

            return Object.entries(frequencyMap)
                .map(([broker, info]) => ({ broker, ...info }))
                .sort((a, b) => b.count - a.count || b.total - a.total)
                .slice(0, 3); // 只取前三
        });
    };

    return {
        positionData,
        profitData,
        isLoading,
        fetchData,
        getTopBrokers
    };
}
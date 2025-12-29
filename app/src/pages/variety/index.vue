<template>
 <div class="container">
    <div class="title">代表性席位盈亏情况</div>
    <brokerProfitsBar
        :pnlData="varietyProfits"
        :variety="variety.symbol"
    />
    <div class="title">席位头寸数据（包括多头、空头与净持仓）</div>

    <div v-for="(broker, index) in alwaysWinningBrokers" :key="index" style="margin-bottom: 20px;">
        <div>{{ broker.broker }}（稳居盈利榜单 {{ broker.count }} 次）</div>

        <div class="brokers-list">
            <div
                v-for="(item, index) in variety.mainVariety"
                :key="index"
                class="variety-list"
            >
                <div class="variety-name">{{ item }}</div>
                <brokersPositionSeries
                    :rawData="varieryPositions"
                    :variety="item"
                    :broker="broker.broker"
                />
            </div>
        </div>
    </div>
 </div>
</template>

<script setup>
import { computed, ref, watch  } from 'vue';
import { useRoute } from 'vue-router/composables'; // 注意：Vue 2.7 需从这里导入
import brokersPositionSeries from './components/brokersPositionSeries.vue';
import brokerProfitsBar from './components/brokerProfitsBar.vue';
import { VARIETIES_LIST } from '@/config/varieties';


const route = useRoute();
const varietyCode = ref('');
const varieryPositions = ref([]);

/** 商品盈亏数据 */
const varietiesProfits = ref({});

/** 常胜席位 */
const alwaysWinningBrokers = ref([]);

watch(
  () => route.params.variety,
  (newVal) => {
    if (newVal) {
      varietyCode.value = newVal;
    }
  },
  { immediate: true } // 立即执行一次，确保初始进入页面时也能获取数据
);

const variety = computed(() => {
    return VARIETIES_LIST.find(v => v.symbol === varietyCode.value);
});

const varietyProfits = computed(() => {
    return varietiesProfits.value[varietyCode.value] || {};
});

const fetchVarietyPosition = async () => {
    try {
        const response = await fetch(process.env.BASE_URL + 'data/variety.json');
        const list = await response.json();
        varieryPositions.value = list || [];
    } catch (error) {
        console.log(error);
    }
}

/** 盈亏数据 */
const fetchVarietyProfit = async () => {
    try {
        const response = await fetch(process.env.BASE_URL + 'data/profit.json');
        const data = await response.json();
        varietiesProfits.value = data || {};
        const sortedBrokers = classifyProfits(varietiesProfits.value[varietyCode.value] || {});
        alwaysWinningBrokers.value = sortedBrokers.slice(0, 3);
    } catch (error) {
        console.log(error);
    }
}

/** 统计各时段稳居盈利前三的“常胜”席位 */
const classifyProfits = (data) => {
    const frequencyMap = {};

    for (const [timeRange, brokers] of Object.entries(data)) {
        // 数据已有序，直接取前3。
        const top3 = brokers
            .slice(0, 3)
            .filter(item => item.value > 0);

        top3.forEach((item) => {
            if (!frequencyMap[item.broker]) {
                frequencyMap[item.broker] = { total: 0, count: 0 };
            }
            frequencyMap[item.broker].total += item.value;
            frequencyMap[item.broker].count += 1;
        });
    }

    // 最终排序逻辑不变：出现频次（count）优先，总额（total）次之
    return Object.entries(frequencyMap)
        .map(([broker, info]) => ({ broker, ...info }))
        .sort((a, b) => b.count - a.count || b.total - a.total);
}

fetchVarietyPosition();
fetchVarietyProfit();
</script>

<style scoped>
.container {
    width: 100%;

    .brokers-list {
        width: 100%;
        display: flex;
    }
    .variety-list {
        flex: 1;
    }

    .title {
        font-weight: 500;
        margin: 16px 0;
    }
}
</style>
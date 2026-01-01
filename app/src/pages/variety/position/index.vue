<template>
    <div class="container">
        <div class="variety">
            <Select
                v-model="selectedSymbol"
                :options="VARIETIES_LIST"
                labelKey="name"
                valueKey="symbol"
                placeholder="商品"
            />
        </div>
      <section class="section-card">
        <div class="section-header">
          <div class="title">代表性席位盈亏情况</div>
        </div>
        <brokerProfitsBar :pnlData="varietyProfits" :variety="variety.symbol" />
      </section>
  
      <div class="section-header" style="margin-top: 40px;">
        <div class="title">核心席位头寸监控</div>
        <div class="subtitle">对比同一席位在不同合约上的持仓演变</div>
      </div>
  
      <div 
        v-for="(broker, index) in alwaysWinningBrokers" 
        :key="selectedSymbol + broker.broker" 
      >
        <div class="broker-sidebar">
            {{ broker.broker }}
        </div>
  
        <div class="contracts-scroll-area">
          <div 
            v-for="(item, idx) in mainVariety" 
            :key="idx" 
            class="contract-chart-item"
          >
            <div class="chart-label">
              <span class="dot"></span>
              {{ item === 'all' ? '全合约汇总' : item }}
            </div>
            <brokersPositionSeries
              :rawData="varieryPositions"
              :variety="item"
              :symbol="selectedSymbol"
              :broker="broker.broker"
            />
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { computed, onBeforeMount, ref, watch  } from 'vue';
import { useRoute } from 'vue-router/composables'; // 注意：Vue 2.7 需从这里导入
import brokersPositionSeries from '../components/brokersPositionSeries.vue';
import brokerProfitsBar from '../components/brokerProfitsBar.vue';
import { VARIETIES_LIST } from '@/config/varieties';


const varieryPositions = ref([]);

/** 商品盈亏数据 */
const varietiesProfits = ref({});
const selectedSymbol = ref('RB');

const variety = computed(() => {
    return VARIETIES_LIST.find(v => v.symbol === selectedSymbol.value);
});

const mainVariety = computed(() => {
    if (variety.value) {
        return ['all', ...variety.value.mainVariety];
    }
    return [];
});

const varietyProfits = computed(() => {
    return varietiesProfits.value[selectedSymbol.value] || {};
});

const alwaysWinningBrokers = computed(() => {
    // 获取当前品种的盈亏数据
    const currentVarietyData = varietiesProfits.value[selectedSymbol.value] || {};
    
    // 执行统计逻辑
    const sortedBrokers = classifyProfits(currentVarietyData);
    
    // 返回前三名
    return sortedBrokers.slice(0, 3);
});

const fetchVarietyPosition = async () => {
    try {
        const response = await fetch(process.env.BASE_URL + 'data/position.json');
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
        const sortedBrokers = classifyProfits(varietiesProfits.value[selectedSymbol.value] || {});
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
      min-height: 100vh;
    }
    
    .section-header {
      margin-bottom: 24px;
    }
    .title {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .subtitle {
      color: #8892b0;
      font-size: 13px;
    }
    
    /* 席位行容器 */
    .broker-row-container {
      display: flex;
      border-radius: 12px;
      overflow: hidden; /* 确保内部区域不超出圆角 */
    }
    
    
    .avatar {
      width: 48px;
      height: 48px;
      background: #4e75ff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(78, 117, 255, 0.3);
    }
    
    .name {
      font-weight: 600;
      font-size: 15px;
    }
    
    .tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: #2d3343;
      color: #8892b0;
    }
    .tag-hot {
      background: rgba(78, 117, 255, 0.15);
      color: #4e75ff;
      border: 1px solid rgba(78, 117, 255, 0.3);
    }
    
    /* 右侧滚动图表区 */
    .contracts-scroll-area {
      flex: 1;
      display: flex;
      gap: 8px;
      overflow-x: auto; /* 核心：支持横向对比 */
    }
    
    /* 隐藏滚动条美化 */
    .contracts-scroll-area::-webkit-scrollbar {
      height: 6px;
    }
    .contracts-scroll-area::-webkit-scrollbar-thumb {
      background: #2d3343;
      border-radius: 3px;
    }
    
    .contract-chart-item {
        flex: 1;
    }
    
    .chart-label {
      font-size: 12px;
      color: #8892b0;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 6px;
      height: 6px;
      background: #4e75ff;
      border-radius: 50%;
    }
    </style>
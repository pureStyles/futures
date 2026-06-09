<template>
  <div class="position-page">
    <section class="toolbar">
      <div>
        <h2>{{ variety.name || selectedSymbol }} 持仓详情</h2>
        <p>结合盈亏榜和主力合约净持仓曲线，观察代表性席位是否持续同向。</p>
      </div>
      <Select
        v-model="selectedSymbol"
        :options="VARIETIES_LIST"
        labelKey="name"
        valueKey="symbol"
        placeholder="商品"
      />
    </section>

    <section class="summary-grid">
      <div class="summary-card">
        <span>主力合约</span>
        <strong>{{ contractText }}</strong>
      </div>
      <div class="summary-card">
        <span>跟踪席位</span>
        <strong>{{ alwaysWinningBrokers.positive.length }}</strong>
      </div>
      <div class="summary-card">
        <span>风险席位</span>
        <strong>{{ alwaysWinningBrokers.negative.length }}</strong>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>代表性席位盈亏情况</h3>
          <p>盈利席位和亏损席位同时用于筛选后续持仓观察对象。</p>
        </div>
      </div>
      <brokerProfitsBar :pnlData="varietyProfits" :variety="variety.symbol" />
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>核心席位头寸监控</h3>
          <p>横向对比全合约、主力与次主力的净持仓变化。</p>
        </div>
      </div>

      <div v-if="alwaysWinningBrokers.positive.length" class="broker-stack">
        <article
          v-for="broker in alwaysWinningBrokers.positive"
          :key="selectedSymbol + broker.name"
          class="broker-card"
        >
          <div class="broker-card-header">
            <router-link
              :to="{ name: 'brokerFundFlow', query: { broker: broker.name, variety: selectedSymbol } }"
            >
              {{ broker.name }}
            </router-link>
            <span>score {{ broker.score }}</span>
          </div>

          <div class="contracts-scroll-area">
            <div
              v-for="item in mainVariety"
              :key="item"
              class="contract-chart-item"
            >
              <div class="chart-label">
                <span class="dot"></span>
                {{ item === 'all' ? '全合约汇总' : item }}
              </div>
              <brokersPositionSeries
                :rawData="positionData"
                :variety="item"
                :symbol="selectedSymbol"
                :broker="broker.name"
                :show="['net']"
              />
            </div>
          </div>
        </article>
      </div>

      <div v-else class="empty-state">当前品种暂未筛选出稳定盈利席位。</div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router/composables';
import brokersPositionSeries from '../components/brokersPositionSeries.vue';
import brokerProfitsBar from '../components/brokerProfitsBar.vue';
import { VARIETIES_LIST } from '@/config/varieties';
import { useData } from '@/composables/useData';

const route = useRoute();
const selectedSymbol = ref(route.params.variety || 'RB');

watch(
  () => route.params.variety,
  (symbol) => {
    if (symbol) selectedSymbol.value = symbol;
  }
);

const { positionData, profitData, fetchData, getAnalyzedBrokers } = useData();

const variety = computed(() => {
  return VARIETIES_LIST.find(v => v.symbol === selectedSymbol.value) || {};
});

const mainVariety = computed(() => {
  if (variety.value.mainVariety) {
    return ['all', ...variety.value.mainVariety];
  }
  return [];
});

const contractText = computed(() => {
  return variety.value.mainVariety?.join(' / ') || '--';
});

const varietyProfits = computed(() => {
  return profitData.value[selectedSymbol.value] || {};
});

const alwaysWinningBrokers = getAnalyzedBrokers(selectedSymbol);

fetchData();
</script>

<style scoped>
.position-page {
  display: grid;
  gap: 18px;
}

.toolbar,
.panel,
.summary-card,
.broker-card {
  border: 1px solid #e1e7ef;
  border-radius: 8px;
  background: #ffffff;
}

.toolbar {
  min-height: 88px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  color: #111827;
  font-size: 22px;
  letter-spacing: 0;
}

h3 {
  color: #111827;
  font-size: 18px;
  letter-spacing: 0;
}

p {
  margin-top: 6px;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

.summary-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 14px;
}

.summary-card {
  padding: 16px;
}

.summary-card span {
  display: block;
  color: #667085;
  font-size: 12px;
}

.summary-card strong {
  display: block;
  margin-top: 10px;
  color: #111827;
  font-size: 20px;
}

.panel {
  padding: 18px;
}

.panel-header {
  margin-bottom: 16px;
}

.broker-stack {
  display: grid;
  gap: 14px;
}

.broker-card {
  padding: 14px;
  min-width: 0;
}

.broker-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.broker-card-header a {
  color: #0f5fb7;
  font-size: 15px;
  font-weight: 800;
}

.broker-card-header span {
  color: #667085;
  font-size: 12px;
}

.contracts-scroll-area {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.contract-chart-item {
  flex: 0 0 360px;
  max-width: 420px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  padding: 10px;
}

.chart-label {
  color: #667085;
  font-size: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 7px;
  height: 7px;
  background: #0f5fb7;
  border-radius: 50%;
}

.empty-state {
  min-height: 180px;
  display: grid;
  place-items: center;
  color: #667085;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

@media (max-width: 820px) {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

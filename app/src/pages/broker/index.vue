<template>
  <div class="broker-page">
    <section class="toolbar">
      <div>
        <h2>{{ selectedBroker }} 持仓工作台</h2>
        <p>用席位维度看净市值分布、当日变化和重点商品走势。</p>
      </div>
      <div class="search-form">
        <Select
          v-model="selectedBroker"
          :options="brokers"
          labelKey="label"
          valueKey="value"
          placeholder="席位"
        />
        <Select
          v-model="selectedSymbol"
          :options="VARIETIES_LIST"
          labelKey="name"
          valueKey="symbol"
          placeholder="商品"
        />
      </div>
    </section>

    <section class="summary-grid">
      <div class="summary-card">
        <span>最大净市值品种</span>
        <strong>{{ topExposure.name || '--' }}</strong>
        <small>{{ formatMoney(topExposure.value) }}</small>
      </div>
      <div class="summary-card">
        <span>最大变动品种</span>
        <strong>{{ topChange.name || '--' }}</strong>
        <small>{{ formatMoney(topChange.value) }}</small>
      </div>
      <div class="summary-card">
        <span>当前观察</span>
        <strong>{{ varietyName || '--' }}</strong>
        <small>{{ selectedSymbol }}</small>
      </div>
    </section>

    <section class="panel">
      <BrokerDistributionPie
        :rawData="brokerStructure"
        :broker="selectedBroker"
      />
    </section>

    <section class="panel">
      <div class="panel-header">
        <h3>{{ varietyName }} 净市值变化</h3>
        <router-link :to="{ name: 'brokerFundFlow', query: { broker: selectedBroker, variety: selectedSymbol } }">
          深入资金动向
        </router-link>
      </div>
      <MarketValueChart
        :rawData="brokerStructure"
        :broker="selectedBroker"
        :variety="varietyName"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router/composables';
import MarketValueChart from './components/MarketValueChart.vue';
import BrokerDistributionPie from './components/BrokerDistributionPie.vue';
import { VARIETIES_LIST } from '@/config/varieties';
import { BROKERS } from '@/config/broker';

const route = useRoute();
const brokerStructure = ref({});
const selectedBroker = ref(route.params.broker || route.query.broker || '国泰君安');
const selectedSymbol = ref(route.query.variety || 'RB');

const fetchData = async () => {
  const result = await fetch('./data/brokerStructure.json');
  brokerStructure.value = await result.json();
};

watch(
  () => [route.params.broker, route.query.broker, route.query.variety],
  ([paramBroker, queryBroker, queryVariety]) => {
    if (paramBroker || queryBroker) selectedBroker.value = paramBroker || queryBroker;
    if (queryVariety) selectedSymbol.value = queryVariety;
  },
  { immediate: true }
);

const brokers = computed(() => {
  return BROKERS.map(e => ({ label: e, value: e }));
});

const varietyName = computed(() => {
  return VARIETIES_LIST.find(e => e.symbol === selectedSymbol.value)?.name || '';
});

const brokerRows = computed(() => {
  const data = brokerStructure.value[selectedBroker.value] || {};
  return Object.entries(data).map(([name, values]) => {
    const latest = values[values.length - 1] || 0;
    const previous = values[values.length - 2] || 0;
    return {
      name,
      latest,
      change: latest - previous
    };
  });
});

const topExposure = computed(() => {
  return [...brokerRows.value].sort((a, b) => Math.abs(b.latest) - Math.abs(a.latest))[0] || {};
});

const topChange = computed(() => {
  return [...brokerRows.value].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0] || {};
});

const formatMoney = (value) => {
  if (!value) return '--';
  return `${(Number(value) / 100000000).toFixed(2)} 亿`;
};

fetchData();
</script>

<style scoped>
.broker-page {
  display: grid;
  gap: 18px;
}

.toolbar,
.summary-card,
.panel {
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

.search-form {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.summary-card {
  padding: 16px;
}

.summary-card span,
.summary-card small {
  display: block;
  color: #667085;
  font-size: 12px;
}

.summary-card strong {
  display: block;
  margin: 10px 0 8px;
  color: #111827;
  font-size: 20px;
}

.panel {
  padding: 18px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.panel-header a {
  color: #0f5fb7;
  font-size: 13px;
  font-weight: 800;
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
}

p {
  margin-top: 6px;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 860px) {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

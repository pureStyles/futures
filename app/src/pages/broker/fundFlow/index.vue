<template>
<div class="fund-page">
    <section class="toolbar">
      <div>
        <h2>{{ selectedBroker || '席位' }} 资金动向</h2>
        <p>观察席位资金在品种间的分布，以及选中商品的净市值时间变化。</p>
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

    <section class="panel">
      <div class="panel-header">
        <h3>席位资金结构</h3>
      </div>
      <BrokerDistributionPie
          :rawData="brokerStructure"
          :broker="selectedBroker"
      />
    </section>

    <section class="panel">
      <div class="panel-header">
        <h3>商品净市值变化</h3>
        <span>{{ varietyName || '请选择商品' }}</span>
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
    import { useRoute } from 'vue-router/composables';
    import { ref, watch, computed  } from 'vue';
    import MarketValueChart from '../components/MarketValueChart.vue';
    import BrokerDistributionPie from '../components/BrokerDistributionPie.vue';
    import { VARIETIES_LIST  } from '@/config/varieties';
    import { BROKERS  } from '@/config/broker';

    const route = useRoute();

    const brokerStructure = ref({});
    const selectedBroker = ref('国泰君安');
    const selectedSymbol = ref('RB');

    const fetchData = async () => {
        const result = await fetch('./data/brokerStructure.json');
        brokerStructure.value = await result.json();
    }

    watch(
        () => [route.query.broker, route.query.variety],
        ([newBroker, newVariety]) => {
            if (newBroker) {
                selectedBroker.value = newBroker;
            }
            if(newVariety) {
                selectedSymbol.value = newVariety;
            }
        },
        { immediate: true } // immediate 确保第一次进入页面时也能触发
    );

    const varietyName = computed(() => {
        const _variety = VARIETIES_LIST.find(e => e.symbol === selectedSymbol.value);
        if (_variety) {
            return _variety.name;
        }
        return ''
    });

    const  brokers = computed(() => {
        return BROKERS.map(e => ({ label: e, value: e }));
    });

    fetchData();
</script> 

<style scoped> 
.fund-page {
    display: grid;
    gap: 18px;
}

.toolbar,
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

.panel {
    padding: 18px;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
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

p,
.panel-header span {
    color: #667085;
    font-size: 13px;
}

p {
    margin-top: 6px;
    line-height: 1.6;
}

@media (max-width: 860px) {
    .toolbar {
        align-items: stretch;
        flex-direction: column;
    }
}
</style>

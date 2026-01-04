<template>
<div class="container">
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
    <h3>席位资金结构</h3>

    <div class="title">
        商品净市值变化
    </div>
    <MarketValueChart 
        :rawData="brokerStructure" 
        :broker="selectedBroker" 
        :variety="varietyName" 
    />
</div>
</template>

<script setup>
    import { useRoute } from 'vue-router/composables';
    import { ref, watch, computed  } from 'vue';
    import MarketValueChart from '../components/MarketValueChart.vue';
    import { VARIETIES_LIST  } from '@/config/varieties';
    import { BROKERS  } from '@/config/broker';

    const route = useRoute();

    const brokerStructure = ref({});
    const selectedBroker = ref('');
    const selectedSymbol = ref('');

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
.search-form {
    display: flex;
    gap: 16px;
}
</style>
<template>
    <div class="page-layout">
        <Select
            v-model="selectedSymbol"
            :options="VARIETIES_LIST"
            labelKey="name"
            valueKey="symbol"
            placeholder="商品"
        />

        <h2>{{ varietyName }}主连K线图</h2>
        <KLineChart 
            :data="varietyKData" 
            :title="varietyName" 
        />
        <div class="header-bar">
        <h2>席位多维监控雷达</h2>
      </div>
        <SeatRadarView :currentVariety="selectedSymbol" />
    </div>
</template>

<script setup>
import { ref, computed  } from 'vue';
import { VARIETIES_LIST  } from '@/config/varieties';
import { useData } from '@/composables/useData';
import brokerNetPosition from '../components/brokerNetPosition.vue';
import SeatRadarView from '../components/SeatRadarView.vue';
import KLineChart from '../components/KLineChart.vue';

const selectedSymbol = ref('RB');
const kData = ref({});

const varietyName = computed(() => {
    const variety = VARIETIES_LIST.find(e => e.symbol === selectedSymbol.value);
    if (variety) {
        return variety.name;
    }
    return '';
})

const varietyKData = computed(() => kData.value[selectedSymbol.value] || {});

const fetchKData = async () => {
    try {
        const response = await fetch(process.env.BASE_URL + 'data/k.json');
        const res = await response.json();
        kData.value = res;
    } catch (error) {
        console.log(error);
    }
}

fetchKData();
</script>

<style scoped>

</style>
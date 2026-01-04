<template>
<div class="container">
    <h3>席位资金结构</h3>

    <div class="title">
        商品净市值变化
    </div>
    <MarketValueChart 
        :rawData="brokerStructure" 
        broker="国泰君安" 
        variety="300沪深" 
    />
</div>
</template>

<script setup>
    import { ref  } from 'vue';
import MarketValueChart from '../components/MarketValueChart.vue';

const brokerStructure = ref({});

const fetchData = async () => {
    const result = await fetch('./data/brokerStructure.json');
    brokerStructure.value = await result.json();
}

fetchData();
</script> 
<template>
    <div class="page-layout">
        <div class="title">净持仓详情</div>
        <div class="search-form">
            <Select
                v-model="selectedSymbol"
                :options="VARIETIES_LIST"
                labelKey="name"
                valueKey="symbol"
                placeholder="商品"
            />
        </div>

        <div v-for="broker in alwaysWinningBrokers" :key="broker.broker">
            <h3>{{ broker.broker }} (上榜 {{ broker.count }} 次)</h3>
            <brokerNetPosition 
                :rawData="positionData"
                :variety="'all'"
                :symbol="selectedSymbol"
                :broker="broker.broker"
            />
      </div>
    </div>
</template>

<script setup>
import { ref, onBeforeMount  } from 'vue';
import { VARIETIES_LIST  } from '@/config/varieties';
import { useData } from '@/composables/useData';
import brokerNetPosition from '../components/brokerNetPosition.vue';

const { positionData, fetchData, getTopBrokers } = useData();

onBeforeMount(() => {
    fetchData(); // 内部会自动判断是否需要真的发请求
});


const selectedSymbol = ref('RB');
const alwaysWinningBrokers = getTopBrokers(selectedSymbol);
</script>

<style scoped>

</style>
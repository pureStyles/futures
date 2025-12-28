<template>
 <div class="container">
    <div class="title">席位头寸数据（包括多头、空头与净持仓）</div>
    <div
        v-for="(item, index) in variety.mainVariety"
        :key="index"
        class="variety-list"
    >
        <brokersPositionSeries
            :rawData="varieryPositions"
            :variety="item"
            broker="国泰君安"
        />
    </div>
    <brokerProfitsBar
        :pnlData="varietyProfits"
        :variety="variety.name"
    />
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
    return VARIETIES_LIST.find(v => v.code === varietyCode.value);
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
    } catch (error) {
        console.log(error);
    }
}

fetchVarietyPosition();
fetchVarietyProfit();
</script>

<style scoped>
.container {
    width: 100%;
    .variety-list {
        width: 100%;
    }

}
</style>
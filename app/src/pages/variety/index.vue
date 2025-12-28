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
 </div>
</template>

<script setup>
import { computed, ref, watch  } from 'vue';
import { useRoute } from 'vue-router/composables'; // 注意：Vue 2.7 需从这里导入
import brokersPositionSeries from './components/brokersPositionSeries.vue';
import { VARIETIES_LIST } from '@/config/varieties';


const route = useRoute();
const varietyCode = ref('');
const varieryPositions = ref([]);

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

const fetchVarietyPosition = async () => {
    try {
        const response = await fetch(process.env.BASE_URL + 'data/variety.json');
        const list = await response.json();
        varieryPositions.value = list || [];
    } catch (error) {
        console.log(error);
    }
}

fetchVarietyPosition();
</script>

<style scoped>
.container {
    width: 100%;
    .variety-list {
        width: 100%;
    }

}
</style>
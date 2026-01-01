<template>
    <div class="page-layout">
        <div class="header-bar">
        <h2>席位多维监控雷达</h2>
        <Select
                v-model="selectedSymbol"
                :options="VARIETIES_LIST"
                labelKey="name"
                valueKey="symbol"
                placeholder="商品"
            />
      </div>
        <SeatRadarView :currentVariety="selectedSymbol" />
    </div>
</template>

<script setup>
import { ref, onBeforeMount  } from 'vue';
import { VARIETIES_LIST  } from '@/config/varieties';
import { useData } from '@/composables/useData';
import brokerNetPosition from '../components/brokerNetPosition.vue';
import SeatRadarView from '../components/SeatRadarView.vue';

const selectedSymbol = ref('RB');
</script>

<style scoped>

</style>
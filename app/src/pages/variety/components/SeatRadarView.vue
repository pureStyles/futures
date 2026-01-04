<template>
    <div class="radar-page">
      <div class="radar-grid">
        <div class="radar-column green-zone">
          <div class="column-header">
            <span class="dot"></span> 核心盈利 (跟随趋势)
          </div>
          <div v-for="b in analyzedData.positive" :key="b.name" class="mini-card">
            <div class="card-title">
                <router-link
                    :to="{
                        name: 'brokerFundFlow',
                        query: { broker: b.name, variety: currentVariety }
                    }"
                    target="_blank"
                >
                    {{ b.name }}
                </router-link>
                    <small>分值:{{b.score}}</small>
                </div>
            <brokerNetPosition :rawData="positionData" :variety="'all'" :symbol="currentVariety" :broker="b.name" />
          </div>
        </div>
  
        <div class="radar-column red-zone">
          <div class="column-header">
            <span class="dot"></span> 逆市席位 (反向指标)
          </div>
          <div v-for="b in analyzedData.negative" :key="b.name" class="mini-card">
            <div class="card-title">{{ b.name }} <small>亏损分:{{b.score}}</small></div>
            <brokerNetPosition :rawData="positionData" :variety="'all'" :symbol="currentVariety" :broker="b.name" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, toRef, onBeforeMount } from 'vue';
  import { useData } from '@/composables/useData';
  import brokerNetPosition from './brokerNetPosition.vue';

  const props = defineProps({
    currentVariety: String,
  });

  const varietyRef = toRef(props, 'currentVariety');
  const { positionData, fetchData, getAnalyzedBrokers } = useData();
  
  // 一次性获取三类数据
  const analyzedData = getAnalyzedBrokers(varietyRef);

  
  onBeforeMount(() => fetchData());
  </script>
  
  <style scoped>
  .radar-grid {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 20px;
  }
  .radar-column {
    flex: 1;
    min-width: 380px;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 15px;
  }
  .column-header {
    font-weight: bold;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .green-zone .dot { background: #23d18b; width: 10px; height: 10px; border-radius: 50%; }
  .yellow-zone .dot { background: #f1c40f; width: 10px; height: 10px; border-radius: 50%; }
  .red-zone .dot { background: #f85149; width: 10px; height: 10px; border-radius: 50%; }
  
  .mini-card {
    background: #fff;
    border-radius: 8px;
    margin-bottom: 15px;
    padding: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .card-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  </style>
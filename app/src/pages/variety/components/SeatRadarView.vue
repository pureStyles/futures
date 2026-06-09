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
  import { toRef, onBeforeMount } from 'vue';
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
    display: grid;
    grid-template-columns: repeat(2, minmax(360px, 1fr));
    gap: 16px;
    overflow-x: auto;
  }
  .radar-column {
    min-width: 380px;
    background: #f8fafc;
    border: 1px solid #e1e7ef;
    border-radius: 8px;
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
    padding: 12px;
    border: 1px solid #eef2f7;
  }
  .card-title {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }

  .card-title a {
    color: #0f5fb7;
  }

  .card-title small {
    color: #667085;
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .radar-grid {
      grid-template-columns: 1fr;
    }

    .radar-column {
      min-width: 0;
    }
  }
  </style>

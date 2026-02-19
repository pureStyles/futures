<template>
  <div class="analysis-container">
    <div class="header">
      <div class="title-row">
        <h2>品种相关性矩阵</h2>
        <span v-if="updateTime" class="time-tag">更新时间: {{ updateTime }}</span>
      </div>
      
      <div class="sector-tabs">
        <button 
          v-for="name in sectorNames" 
          :key="name"
          :class="{ active: currentSector === name }"
          @click="currentSector = name"
        >
          {{ name }} ({{ sectors[name].varieties.length }})
        </button>
      </div>
    </div>
    
    <div class="content-card">
      <CorrelationHeatmap 
        v-if="currentSectorData" 
        :data="currentSectorData" 
      />
      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>正在加载分类数据...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CorrelationHeatmap from '../components/CorrelationHeatmap.vue';

// 原始 JSON 数据
const sectors = ref({});
const updateTime = ref('');
const currentSector = ref('其他'); // 默认选中板块

// 计算属性：提取所有板块名称
const sectorNames = computed(() => Object.keys(sectors.value));

// 计算属性：提取当前选中的板块数据
const currentSectorData = computed(() => {
  return sectors.value[currentSector.value] || null;
});

const loadData = async () => {
  try {
    // 加上时间戳防止浏览器缓存 JSON
    const res = await fetch(`/data/correlationData.json?t=${Date.now()}`);
    const result = await res.json();
    
    sectors.value = result.sectors;
    updateTime.value = result.updateTime;
    
    // 如果“其他”板块没数据，自动选第一个
    if (!result.sectors['其他'] && sectorNames.value.length > 0) {
      currentSector.value = sectorNames.value[0];
    }
  } catch (e) {
    console.error("加载相关性 JSON 失败:", e);
  }
};

onMounted(loadData);
</script>

<style scoped>
.analysis-container { padding: 25px; background: #f0f2f5; min-height: 100vh; }

.header { margin-bottom: 20px; }
.title-row { display: flex; align-items: baseline; gap: 15px; margin-bottom: 15px; }
.time-tag { font-size: 12px; color: #999; }

.sector-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.sector-tabs button {
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  color: #606266;
}
.sector-tabs button:hover { color: #409eff; border-color: #c6e2ff; background-color: #ecf5ff; }
.sector-tabs button.active {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.content-card { 
  background: #fff; 
  border-radius: 12px; 
  min-height: 700px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
}

.loading-state {
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}
/* 简单的加载动画 */
.spinner {
  width: 40px; height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
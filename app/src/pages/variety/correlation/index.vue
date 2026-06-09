<template>
  <div class="analysis-container">
    <section class="toolbar">
      <div>
        <h2>品种相关性矩阵</h2>
        <p>按板块切换热力图，优先查看高相关品种簇。</p>
      </div>
      <span v-if="updateTime" class="time-tag">更新时间 {{ updateTime }}</span>
    </section>

    <section class="tabs-panel">
      <button
        v-for="name in sectorNames"
        :key="name"
        :class="{ active: currentSector === name }"
        type="button"
        @click="currentSector = name"
      >
        {{ name }}
        <span>{{ sectors[name].varieties.length }}</span>
      </button>
    </section>

    <section class="content-card">
      <CorrelationHeatmap
        v-if="currentSectorData"
        :data="currentSectorData"
      />
      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>正在加载分类数据...</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CorrelationHeatmap from '../components/CorrelationHeatmap.vue';

const sectors = ref({});
const updateTime = ref('');
const currentSector = ref('其他');

const sectorNames = computed(() => Object.keys(sectors.value));
const currentSectorData = computed(() => {
  return sectors.value[currentSector.value] || null;
});

const loadData = async () => {
  try {
    const res = await fetch(`./data/correlationData.json?t=${Date.now()}`);
    const result = await res.json();

    sectors.value = result.sectors;
    updateTime.value = result.updateTime;

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
.analysis-container {
  display: grid;
  gap: 18px;
}

.toolbar,
.tabs-panel,
.content-card {
  border: 1px solid #e1e7ef;
  border-radius: 8px;
  background: #ffffff;
}

.toolbar {
  min-height: 88px;
  padding: 18px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

h2,
p {
  margin: 0;
}

h2 {
  color: #111827;
  font-size: 22px;
  letter-spacing: 0;
}

p {
  margin-top: 6px;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

.time-tag {
  color: #667085;
  border: 1px solid #e1e7ef;
  border-radius: 8px;
  padding: 8px 10px;
  background: #f8fafc;
  font-size: 12px;
  white-space: nowrap;
}

.tabs-panel {
  padding: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tabs-panel button {
  min-height: 34px;
  border: 1px solid #d8e0ea;
  background: #fff;
  border-radius: 8px;
  padding: 0 10px;
  cursor: pointer;
  color: #344054;
  font-size: 13px;
  font-weight: 700;
}

.tabs-panel button span {
  margin-left: 6px;
  color: #7a8699;
  font-size: 12px;
}

.tabs-panel button:hover {
  border-color: #8bb7e8;
  background: #f7fbff;
}

.tabs-panel button.active {
  background: #0f5fb7;
  color: #fff;
  border-color: #0f5fb7;
}

.tabs-panel button.active span {
  color: rgba(255, 255, 255, 0.78);
}

.content-card {
  min-height: 680px;
  padding: 12px;
}

.loading-state {
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #667085;
}

.spinner {
  width: 34px;
  height: 34px;
  border: 3px solid #e5eaf2;
  border-top: 3px solid #0f5fb7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 760px) {
  .toolbar {
    display: block;
  }

  .time-tag {
    display: inline-block;
    margin-top: 14px;
  }
}
</style>

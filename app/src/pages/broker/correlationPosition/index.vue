<template>
    <div class="page-layout">
      <div class="top-nav">
        <div class="title-section">
          <span class="main-title">席位强相关品种分布分析</span>
          <span class="sub-tag" v-if="updateTime">Update: {{ updateTime }}</span>
        </div>
        <div class="filter-section">
          <label>分析席位：</label>
          <select v-model="selectedBroker" class="broker-select">
            <option v-for="name in brokerList" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
      </div>

      <div class="net-positions-wrapper">
        <!-- <brokerNetPosition
            :rawData="positionData"
            :variety="'all'"
            :symbol="currentVariety"
            :broker="b.name"
        /> -->
      </div>
  
      <div class="chart-wrapper">
        <QuadrantChart 
          v-if="currentData" 
          :chart-data="currentData" 
          :broker-name="selectedBroker"
          @circle-click="handleCircleClick"
        />
        <div v-else class="loading-box">正在解析席位头寸数据...</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import QuadrantChart from './components/QuadrantChart.vue';
  import brokerNetPosition from '@/pages/variety/components/brokerNetPosition.vue';
  
  const allData = ref({});
  const updateTime = ref('');
  const selectedBroker = ref('国泰君安');

  const selectedGroupName = ref('');
  const activeVarieties = ref([]);
  
  const brokerList = computed(() => Object.keys(allData.value));
  const currentData = computed(() => allData.value[selectedBroker.value] || null);
  
  const init = async () => {
    try {
      const res = await fetch('./data/brokerQuadrant.json');
      const json = await res.json();
      allData.value = json.data;
      updateTime.value = json.updateTime;
      
      // 检查 URL 参数
      const urlParams = new URLSearchParams(window.location.search);
      const b = urlParams.get('broker');
      if (b && allData.value[b]) selectedBroker.value = b;
    } catch (e) {
      console.error("Data Load Error", e);
    }
  };
    const handleCircleClick = (groupName) => {
        selectedGroupName.value = groupName;
        
        // 从 currentData 中找到选中的集群，提取品种列表
        // 我们之前的 Task 脚本里已经在详情里带了品种
        const group = currentData.value.find(item => item.name === groupName);
        console.log("点击了集群:", groupName, group);
        if (group && group.details && group.details.varieties) {
            activeVarieties.value = group.details.varieties;
            
            // 自动滚动到上方查看图表
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
  
  onMounted(init);
  </script>
  
  <style scoped>
  .page-layout { padding: 20px; background: #f4f6f9; min-height: 100vh; font-family: sans-serif; }
  .top-nav { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 15px 25px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
  .main-title { font-size: 18px; font-weight: bold; color: #2c3e50; }
  .sub-tag { font-size: 12px; color: #95a5a6; margin-left: 10px; }
  .broker-select { padding: 6px 12px; border: 1px solid #dcdfe6; border-radius: 5px; cursor: pointer; }
  .chart-wrapper { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .loading-box { height: 400px; display: flex; align-items: center; justify-content: center; color: #999; }
  </style>
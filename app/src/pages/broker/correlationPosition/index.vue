<template>
    <div class="page-layout">
      <section class="toolbar">
        <div>
          <h2>席位强相关品种分布分析</h2>
          <p>把同一席位下相关性更强的品种聚成象限，辅助识别组合暴露。</p>
          <span class="sub-tag" v-if="updateTime">更新时间 {{ updateTime }}</span>
        </div>
        <Select
          v-model="selectedBroker"
          :options="brokerOptions"
          labelKey="label"
          valueKey="value"
          placeholder="席位"
        />
      </section>

      <div class="net-positions-wrapper">
        <!-- <brokerNetPosition
            :rawData="positionData"
            :variety="'all'"
            :symbol="currentVariety"
            :broker="b.name"
        /> -->
      </div>
  
      <section class="chart-wrapper">
        <QuadrantChart 
          v-if="currentData" 
          :chart-data="currentData" 
          :broker-name="selectedBroker"
          @circle-click="handleCircleClick"
        />
        <div v-else class="loading-box">正在解析席位头寸数据...</div>
      </section>
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
  const brokerOptions = computed(() => brokerList.value.map(name => ({ label: name, value: name })));
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
  .page-layout {
    display: grid;
    gap: 18px;
  }

  .toolbar,
  .chart-wrapper {
    border: 1px solid #e1e7ef;
    border-radius: 8px;
    background: #fff;
  }

  .toolbar {
    min-height: 88px;
    padding: 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
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

  .sub-tag {
    display: inline-block;
    margin-top: 10px;
    color: #667085;
    font-size: 12px;
  }

  .chart-wrapper {
    padding: 18px;
  }

  .loading-box { height: 400px; display: flex; align-items: center; justify-content: center; color: #999; }

  @media (max-width: 760px) {
    .toolbar {
      align-items: stretch;
      flex-direction: column;
    }
  }
  </style>

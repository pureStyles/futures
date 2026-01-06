<template>
    <div class="pie-charts-wrapper">
      <div ref="changePieRef" class="chart-box"></div>
      <div ref="marketValuePieRef" class="chart-box"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  
  const props = defineProps({
    rawData: { type: Object, required: true },
    broker: { type: String, default: '国泰君安' }
  });
  
  const marketValuePieRef = ref(null);
  const changePieRef = ref(null);
  let marketChart = null;
  let changeChart = null;
  
  const initCharts = () => {
    if (marketValuePieRef.value) marketChart = echarts.init(marketValuePieRef.value);
    if (changePieRef.value) changeChart = echarts.init(changePieRef.value);
    render();
  };

  const render = () => {
  const brokerData = props.rawData[props.broker];
  if (!brokerData) return;

  const varieties = Object.keys(brokerData);

  // --- 1. 净市值分布 (逻辑不变) ---
  const marketValueData = varieties.map(name => {
    const vals = brokerData[name];
    const latest = vals[vals.length - 1] || 0;
    return { name, value: (Math.abs(latest) / 100000000).toFixed(2) };
  });

  // --- 2. 今日持仓变化分布 (引入绝对值分母) ---
  let totalAbsChange = 0;
  const changeDetails = varieties.map(name => {
    const vals = brokerData[name];
    const today = vals[vals.length - 1] || 0;
    const yesterday = vals[vals.length - 2] || 0;
    const diff = Math.abs((today - yesterday)); // 单位：亿
    
    totalAbsChange += Math.abs(diff); // 累加绝对值作为分母
    
    return { name, realDiff: diff / 100000000 };
  });

  const changePieData = changeDetails.map(item => {
    // 计算基于绝对值总和的占比
    const ratio = totalAbsChange > 0 
      ? ((Math.abs(item.realDiff) / totalAbsChange) * 100).toFixed(2) 
      : 0;

    return {
      name: item.name,
      value: Math.abs(item.realDiff).toFixed(2), // 饼图面积由绝对值决定
      realValue: item.realDiff.toFixed(2),     // Tooltip 显示带符号的真实值
      ratio: ratio                             // 存储计算后的百分比
    };
  }).filter(item => parseFloat(item.value) > 0); // 过滤无变化的品种

  // 渲染
  marketChart.setOption(getPieOption('商品净市值分布 (亿)', marketValueData));
  changeChart.setOption(getPieOption('今日持仓变化分布 (基于变动绝对值)', changePieData, true));
};
  
  const getPieOption = (title, data, isChange = false) => {
    return {
      title: { text: title, left: 'center', top: 20, textStyle: { fontSize: 14 } },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const val = isChange ? data[params.dataIndex].realValue : params.value;
          return `${params.seriesName} <br/>${params.name}: <b>${val} 亿</b> (${params.percent}%)`;
        }
      },
      legend: { bottom: '5%', left: 'center', type: 'scroll' },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold' }
          },
          data: data
        }
      ]
    };
  };
  
  watch(() => [props.rawData, props.broker], render, { deep: true });
  
  onMounted(() => {
    initCharts();
    window.addEventListener('resize', () => {
      marketChart?.resize();
      changeChart?.resize();
    });
  });
  
  onUnmounted(() => {
    marketChart?.dispose();
    changeChart?.dispose();
  });
  </script>
  
  <style scoped>
  .pie-charts-wrapper {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
  }
  .chart-box {
    width: 48%;
    min-width: 350px;
    height: 400px;
  }
  @media (max-width: 768px) {
    .chart-box { width: 100%; }
  }
  </style>
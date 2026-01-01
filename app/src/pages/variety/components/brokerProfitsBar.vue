<template>
    <div class="pnl-container">
      <div class="chart-header">
        <span class="chart-title">席位盈亏估算 ({{ variety }})</span>
        <div class="time-tabs">
          <span 
            :class="{ active: timeRange === 'year' }" 
            @click="timeRange = 'year'"
          >近一年</span>
          <span 
            :class="{ active: timeRange === 'half_year' }" 
            @click="timeRange = 'half_year'"
          >近半年</span>
        </div>
      </div>
      <div ref="chartRef" class="echarts-dom" :style="{ height: chartHeight }"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  
  const props = defineProps({
    // 传入 RB 或 CF 的数据对象
    pnlData: {
      type: Object,
      default: () => ({ year: [], half_year: [] })
    },
    variety: {
      type: String,
      default: ''
    }
  });
  
  const chartRef = ref(null);
  let myChart = null;
  const timeRange = ref('year'); // 默认展示近一年
  
  // 根据切换的标签，获取对应的绘图数据
  const currentData = computed(() => {
    const data = props.pnlData[timeRange.value] || [];
    // 按照金额大小排序，确保图表美观
    return [...data].sort((a, b) => a.value - b.value);
  });

  const chartHeight = computed(() => {
        const itemHeight = 20; // 每个柱子占据的高度
        const minHeight = 300; // 最小高度
        const calculatedHeight = currentData.value.length * itemHeight; // 加上 header 和 padding
        return Math.max(minHeight, calculatedHeight) + 'px';
    });
  
  const initChart = () => {
    if (!chartRef.value) return;
    myChart = echarts.init(chartRef.value);
    renderChart();
  };
  
  const renderChart = () => {
    const brokers = currentData.value.map(item => item.broker);
    const values = currentData.value.map(item => item.value);
  
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          const val = params[0].value;
          const color = val >= 0 ? '#f85149' : '#23d18b';
          return `${params[0].name}<br/>盈亏: <span style="color:${color}">${(val / 10000).toFixed(2)} 万</span>`;
        }
      },
      grid: {
        top: '0',
        left: '3%',
        right: '8%',
        bottom: '0',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#30363d' } },
        axisLabel: { }
      },
      yAxis: {
        type: 'category',
        data: brokers,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 12 }
      },
      series: [
        {
          name: '盈亏金额',
          type: 'bar',
          stack: 'total',
          label: {
            show: true,
            position: 'right',
            formatter: (params) => (params.value / 10000).toFixed(2) + '万',
          },
          data: values.map(val => ({
            value: val,
            itemStyle: {
              // 正值为红，负值为绿
              color: val >= 0 ? '#f85149' : '#23d18b',
              borderRadius: [0, 4, 4, 0]
            }
          }))
        }
      ]
    };
  
    myChart.setOption(option);
  };
  
  // 监听数据或时间维度变化，重绘图表
  watch([currentData, () => props.variety], () => {
    renderChart();
  });
  
  onMounted(() => {
    initChart();
    window.addEventListener('resize', () => myChart?.resize());
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', () => myChart?.resize());
    myChart?.dispose();
  });
  </script>
  
  <style scoped>
  .pnl-container {
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #30363d;
  }
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .chart-title {
    font-size: 16px;
    font-weight: bold;
  }
  
  .time-tabs {
    background-color: #8892b0;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    gap: 4px;
  }
  
  .time-tabs span {
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;
  }
  
  .time-tabs span.active {
    background: #fff;
  }
  
  .echarts-dom {
    width: 100%;
  }
  </style>
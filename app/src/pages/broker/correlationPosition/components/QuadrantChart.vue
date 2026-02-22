<template>
    <div class="chart-container">
      <div ref="chartRef" class="quadrant-canvas"></div>
    </div>
  </template>
  
  <script setup>
  import * as echarts from 'echarts';
  import { ref, onMounted, watch, onUnmounted } from 'vue';
  
  const props = defineProps({
    chartData: { type: Array, required: true },
    brokerName: { type: String, default: '席位' }
  });
  
  const emit = defineEmits(['circle-click']);
  
  const chartRef = ref(null);
  let myChart = null;
  
  const renderChart = () => {
    if (!chartRef.value || !props.chartData) return;
    if (!myChart) myChart = echarts.init(chartRef.value);

    myChart.on('click', (params) => {
      // params.data 结构取决于我们在 series.data 中定义的数组内容
      // 按照之前的代码，数组是 [x, y, size, name]
      if (params.componentType === 'series') {
        const groupName = params.data[3];
        // 触发自定义事件，通知父组件
        emit('circle-click', groupName);
      }
    });
  
    const option = {
      title: { 
        text: `${props.brokerName} 持仓多空分布图`, 
        left: 'center',
        top: 10 
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        formatter: (p) => {
          const [x, y, size, name] = p.data;
          const sentiment = x > 50 ? '多头占优' : (x < 50 ? '空头占优' : '多空平衡');
          return `
            <div style="font-weight:bold;border-bottom:1px solid #eee;margin-bottom:5px;padding-bottom:5px">${name}</div>
            多空占比(X): <b>${x.toFixed(1)}%</b> (${sentiment})<br/>
            净持仓市值(Y): <b>${(y / 100000000).toFixed(2)} 亿</b><br/>
            总持仓规模: <b>${(size / 100000000).toFixed(2)} 亿</b>
          `;
        }
      },
      grid: { left: '8%', right: '10%', bottom: '12%', top: '15%', containLabel: true },
      xAxis: {
        name: '空头占优 ⬅ 多空占比(%) ➡ 多头占优',
        nameLocation: 'middle',
        nameGap: 35,
        type: 'value',
        min: 0,
        max: 100,
        interval: 25,
        splitLine: { show: true, lineStyle: { type: 'dashed' } },
        // 在 50 的位置画垂直中轴线
        markLine: {
          silent: true,
          symbol: 'none',
          label: { position: 'end', formatter: '多空平衡 (50)' },
          data: [{ xAxis: 50, lineStyle: { color: '#333', type: 'solid', width: 2 } }]
        }
      },
      yAxis: {
        name: '净持仓市值 (亿元)',
        type: 'value',
        splitLine: { show: true, lineStyle: { type: 'dashed' } },
        // 在 0 的位置画水平中轴线
        markLine: {
          silent: true,
          symbol: 'none',
          label: { position: 'end', formatter: '市值平衡 (0)' },
          data: [{ yAxis: 0, lineStyle: { color: '#333', type: 'solid', width: 2 } }]
        },
        axisLabel: {
          formatter: (val) => (val / 100000000).toFixed(1)
        }
      },
      series: [{
        name: '席位持仓',
        type: 'scatter',
        data: props.chartData.map(d => [d.x, d.y, d.size, d.name]),
        symbolSize: (val) => {
          // 圆形面积映射
          return Math.max(Math.sqrt(Math.abs(val[2])) / 1400, 15);
        },
        label: {
          show: true,
          position: 'right',
          formatter: (p) => p.data[3],
          fontSize: 12,
          fontWeight: 'bold'
        },
        itemStyle: {
          // 根据 Y 轴正负着色（净多红，净空绿）
          color: (p) => p.data[1] >= 0 ? '#f56c6c' : '#67c23a',
          opacity: 0.7,
          borderWidth: 1,
          borderColor: '#fff',
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.1)'
        },
        emphasis: {
          itemStyle: { opacity: 1, borderWidth: 2, shadowBlur: 10 }
        }
      }]
    };
  
    myChart.setOption(option, true);
  };
  
  watch(() => props.chartData, renderChart, { deep: true });
  
  onMounted(() => {
    renderChart();
    window.addEventListener('resize', () => myChart && myChart.resize());
  });
  
  onUnmounted(() => {
    if (myChart) myChart.dispose();
  });
  </script>
  
  <style scoped>
  .quadrant-canvas { width: 100%; height: 600px; }
  </style>
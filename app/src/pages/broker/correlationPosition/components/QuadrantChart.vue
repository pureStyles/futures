<template>
    <div class="chart-container">
      <div ref="chartRef" class="quadrant-canvas"></div>
      <div class="zoom-tip">💡 提示：可使用鼠标滚轮对局部密集区域进行缩放</div>
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
    if (!myChart) {
      myChart = echarts.init(chartRef.value);
      
      // 绑定点击事件
      myChart.on('click', (params) => {
        if (params.componentType === 'series') {
          const groupName = params.data[3]; // 取出名称
          emit('circle-click', groupName);
        }
      });
    }
  
    const option = {
      title: { 
        text: `${props.brokerName} 持仓多空分布 (0-100)`, 
        left: 'center',
        top: 10 
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        formatter: (p) => {
          const [x, y, size, name] = p.data;
          return `
            <div style="font-weight:bold;border-bottom:1px solid #eee;padding-bottom:5px;margin-bottom:5px">${name}</div>
            多头占比: <b>${x.toFixed(1)}%</b><br/>
            净持仓市值: <b>${(y / 100000000).toFixed(2)} 亿</b><br/>
            总持仓规模: <b>${(size / 100000000).toFixed(2)} 亿</b>
          `;
        }
      },
      // 开启缩放功能，解决重叠后的深度查看问题
      dataZoom: [
        { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
        { type: 'inside', yAxisIndex: 0, filterMode: 'none' }
      ],
      grid: { left: '8%', right: '10%', bottom: '12%', top: '15%', containLabel: true },
      xAxis: {
        name: '多空比例 (%)',
        nameLocation: 'middle',
        nameGap: 35,
        min: 0, max: 100,
        splitLine: { show: true, lineStyle: { type: 'dashed' } },
        markLine: {
          silent: true, symbol: 'none',
          label: { position: 'end', formatter: '平衡 (50)' },
          data: [{ xAxis: 50, lineStyle: { color: '#333', type: 'solid', width: 2 } }]
        }
      },
      yAxis: {
        name: '净持仓市值 (亿元)',
        splitLine: { show: true, lineStyle: { type: 'dashed' } },
        markLine: {
          silent: true, symbol: 'none',
          label: { position: 'end', formatter: '净持仓 0' },
          data: [{ yAxis: 0, lineStyle: { color: '#333', type: 'solid', width: 2 } }]
        },
        axisLabel: { formatter: (val) => (val / 100000000).toFixed(1) }
      },
      series: [{
        type: 'scatter',
        data: props.chartData.map(d => [d.x, d.y, d.size, d.name]),
        symbolSize: (val) => Math.max(Math.sqrt(Math.abs(val[2])) / 1400, 15),
        cursor: 'pointer',
        
        // --- 核心防重叠配置 ---
        itemStyle: {
          color: (p) => p.data[1] >= 0 ? '#f56c6c' : '#67c23a',
          opacity: 0.6, // 半透明便于观察重叠部分
          borderWidth: 1,
          borderColor: '#fff'
        },
        label: {
          show: true,
          position: 'right',
          distance: 10,
          formatter: (p) => p.data[3],
          fontSize: 12,
          fontWeight: 'bold',
          minMargin: 5 // 标签间最小间距
        },
        labelLine: {
          show: true, // 开启引导线
          lineStyle: { color: '#999', type: 'dashed' }
        },
        labelLayout: {
          hideOverlap: false,   // 不隐藏重叠标签
          moveOverlap: 'shiftY'  // 纵向自动避让
        },
        emphasis: {
          focus: 'self', // 悬浮时突出显示当前气泡，背景淡化
          itemStyle: { opacity: 1, borderWidth: 2 }
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
  .chart-container { position: relative; width: 100%; }
  .quadrant-canvas { width: 100%; height: 600px; }
  .zoom-tip { 
    text-align: center; 
    font-size: 12px; 
    color: #999; 
    margin-top: 10px; 
  }
  </style>
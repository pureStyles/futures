<template>
    <div class="chart-container">
      <div ref="chartRef" style="width: 100%; height: 450px;"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, onUnmounted } from 'vue';
  import * as echarts from 'echarts';
  
  const props = defineProps({
    rawData: {
      type: Object,
      required: true
    },
    broker: {
      type: String,
      default: '国泰君安'
    },
    variety: {
      type: String,
      default: '300沪深'
    }
  });
  
  const chartRef = ref(null);
  let myChart = null;
  
  // 数据转换逻辑
  const prepareData = () => {
    if (!props.rawData || !props.rawData.dates) return [];
    
    const dates = props.rawData.dates;
    const values = props.rawData[props.broker]?.[props.variety] || [];
  
    return dates.map((date, index) => {
      const currentVal = values[index] || 0;
      const marketValueValue = currentVal / 100000000; // 换算成亿
      
      let rate = 0;
      if (index > 0 && values[index - 1] !== 0) {
        const prevVal = values[index - 1];
        rate = ((currentVal - prevVal) / Math.abs(prevVal)) * 100;
      }
  
      return {
        date,
        marketValue: marketValueValue.toFixed(2),
        rate: rate.toFixed(2)
      };
    });
  };
  
  const renderChart = () => {
    if (!chartRef.value) return;
    if (!myChart) {
      myChart = echarts.init(chartRef.value);
    }
  
    const seriesData = prepareData();
  
    const option = {
      backgroundColor: 'transparent',
      title: {
        text: `${props.broker} - ${props.variety} 净市值变化趋势`,
        left: 'center',
        top: 10,
        textStyle: { fontSize: 16, color: '#111827', fontWeight: 700 }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params) => {
          let html = `<div style="font-weight:bold">${params[0].name}</div>`;
          params.forEach(item => {
            const unit = item.seriesName === '净市值' ? ' 亿' : '%';
            const color = item.color instanceof Object ? item.color.colorStops[0].color : item.color;
            html += `<div style="margin-top:5px">
                      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:5px"></span>
                      ${item.seriesName}: <span style="float:right;margin-left:15px;font-weight:bold">${item.value}${unit}</span>
                    </div>`;
          });
          return html;
        }
      },
      legend: {
        data: ['净市值', '变化率'],
        bottom: 10
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '15%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: seriesData.map(i => i.date),
        axisLine: { lineStyle: { color: '#d8e0ea' } },
        axisLabel: { color: '#667085' }
      },
      yAxis: [
        {
          type: 'value',
          name: '净市值 (亿)',
          position: 'left',
          axisLine: { show: true, lineStyle: { color: '#5470c6' } },
          splitLine: { lineStyle: { type: 'dashed', color: '#eef2f7' } },
          axisLabel: { color: '#667085' }
        },
        {
          type: 'value',
          name: '变化率 (%)',
          position: 'right',
          axisLine: { show: true, lineStyle: { color: '#667085' } },
          splitLine: { show: false },
          axisLabel: {
            formatter: '{value}%',
            color: '#667085'
          }
        }
      ],
      series: [
        {
          name: '净市值',
          type: 'line',
          yAxisIndex: 0,
          data: seriesData.map(i => i.marketValue),
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3, color: '#5470c6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84,112,198,0.4)' },
              { offset: 1, color: 'rgba(84,112,198,0)' }
            ])
          }
        },
        {
          name: '变化率',
          type: 'bar',
          yAxisIndex: 1,
          data: seriesData.map(i => i.rate),
          barMaxWidth: 15,
          itemStyle: {
            color: (params) => params.data >= 0 ? '#ef5350' : '#26a69a',
            borderRadius: [2, 2, 0, 0]
          }
        }
      ]
    };
  
    myChart.setOption(option);
  };
  
  // 监听数据变化
  watch(() => [props.rawData, props.broker, props.variety], () => {
    renderChart();
  }, { deep: true });
  
  // 自适应大小
  const handleResize = () => myChart?.resize();
  
  onMounted(() => {
    renderChart();
    window.addEventListener('resize', handleResize);
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    myChart?.dispose();
  });
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
  }
  </style>

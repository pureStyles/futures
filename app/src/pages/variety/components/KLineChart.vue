<template>
    <div ref="chartRef" style="width: 100%; height: 400px;"></div>
  </template>
  
  <script setup>
  import * as echarts from 'echarts';
  import { ref, onMounted, watch, onUnmounted } from 'vue';
  
  const props = defineProps({
    // 接收你提供的数据格式，例如 props.data = { dates: [...], infos: [...] }
    data: {
      type: Object,
    },
    title: String
  });
  
  const chartRef = ref(null);
  let myChart = null;
  
  // 初始化配置
  const getOption = (dates, values) => {
    return {
      title: {
        text: props.title,
        left: 0,
        textStyle: { fontSize: 14, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        textStyle: { color: '#000' }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '10%'
      },
      xAxis: {
        type: 'category',
        data: dates,
        scale: true,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#ccc' } },
        splitLine: { show: false }
      },
      yAxis: {
        scale: true,
        splitLine: { lineStyle: { color: '#eee' } },
        axisLine: { show: false }
      },
      // 数据缩放组件（实现放大、缩小、滑动）
      dataZoom: [
        {
          type: 'inside', // 内置在坐标系中，通过鼠标滚轮或触摸缩放
          start: 30,      // 默认展示后 50% 的数据
          end: 100
        },
        {
          show: true,     // 下方显示滑动条
          type: 'slider',
          top: '90%',
          start: 30,
          end: 100,
          handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '80%',
          handleStyle: {
              color: '#fff',
              shadowBlur: 3,
              shadowColor: 'rgba(0, 0, 0, 0.6)',
              shadowOffsetX: 2,
              shadowOffsetY: 2
          }
        }
      ],
      series: [
        {
          type: 'candlestick',
          data: values,
          itemStyle: {
            color: 'transparent',      // 阳线颜色（红）
            color0: '#23d18b',     // 阴线颜色（绿）
            borderColor: '#f85149',
            borderColor0: '#23d18b',
            borderWidth: 1.5,
          }
        }
      ]
    };
  };
  
  const renderChart = () => {
    if (!chartRef.value || !props.data.dates) return;
    
    if (!myChart) {
      myChart = echarts.init(chartRef.value);
    }
    
    const option = getOption(props.data.dates, props.data.infos);
    myChart.setOption(option);
  };
  
  onMounted(() => {
    renderChart();
    window.addEventListener('resize', () => myChart?.resize());
  });
  
  watch(() => props.data, renderChart, { deep: true });
  
  onUnmounted(() => {
    window.removeEventListener('resize', () => myChart?.resize());
    myChart?.dispose();
  });
  </script>
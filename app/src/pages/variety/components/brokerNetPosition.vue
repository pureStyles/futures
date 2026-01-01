<template>
    <div ref="chart" style="width:100%; height:400px"></div>
  </template>
  
  <script setup>
  import * as echarts from 'echarts'
  import { onMounted, ref, watch } from 'vue'
  
  const props = defineProps({
    rawData: Array,
    variety: String,
    broker: String,
    symbol: String
  })
  
  const chart = ref(null);
  let instance = null;
  
  onMounted(() => {
    instance = echarts.init(chart.value)
    render()
  })
  
  watch(() => [props.rawData, props.variety, props.broker, props.symbol], render, { deep: true })
  
  const prepareData = (data, variety, brokerName) => {
    return data.map((day, index) => {
      const pos = day.positions?.[props.symbol]?.[variety];
      if (!pos) return null;
  
      const longItem = pos.longPosition?.find(i => i.broker === brokerName);
      const currentNet = longItem?.net_position ?? 0;
  
      let rate = 0;
      if (index > 0) {
        const prevPos = data[index - 1].positions?.[props.symbol]?.[variety];
        const prevLong = prevPos?.longPosition?.find(i => i.broker === brokerName);
        const prevNet = prevLong?.net_position ?? 0;
        
        // 计算变动比例，分母取绝对值防止正负反转逻辑错误
        if (prevNet !== 0) {
          rate = ((currentNet - prevNet) / Math.abs(prevNet)) * 100;
        }
      }
  
      return {
        date: day.date,
        net: currentNet,
        rate: rate.toFixed(2)
      };
    }).filter(Boolean);
  }
  
  function render() {
    if (!instance || !props.rawData) return
    const seriesData = prepareData(props.rawData, props.variety, props.broker)
  
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: { data: ['净持仓', '变动比例'], top: 10 },
      grid: { left: 60, right: 60, top: 60, bottom: 40 },
      xAxis: {
        type: 'category',
        data: seriesData.map(i => i.date),
        axisLine: { lineStyle: { color: '#ccc' } }
      },
      yAxis: [
        {
          type: 'value',
          name: '净持仓',
          position: 'left',
          splitLine: { lineStyle: { color: '#eee' } },
          axisLine: { show: true, lineStyle: { color: '#000' } }
        },
        {
          type: 'value',
          name: '变动率 (%)',
          position: 'right',
          splitLine: { show: false }, // 隐藏右侧网格线避免混乱
          axisLabel: { formatter: '{value}%' },
          axisLine: { show: true, lineStyle: { color: '#666' } }
        }
      ],
      series: [
        {
          name: '变动比例',
          type: 'bar',
          yAxisIndex: 1, // 使用右侧 Y 轴
          data: seriesData.map(i => i.rate),
          itemStyle: {
            color: (params) => params.data >= 0 ? '#f85149' : '#23d18b',
            opacity: 0.6
          },
          label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              fontSize: 10,
              color: '#666'
          }
        },
        {
          name: '净持仓',
          type: 'line',
          yAxisIndex: 0, // 使用左侧 Y 轴
          smooth: true,
          symbolSize: 8,
          data: seriesData.map(i => i.net),
          itemStyle: { color: '#000' },
          lineStyle: { width: 3 }
        }
      ]
    }
  
    instance.setOption(option, true)
  }
  </script>
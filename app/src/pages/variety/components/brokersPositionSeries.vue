<template>
    <div ref="chart" style="width:100%;height:400px"></div>
  </template>
  
  <script setup>
  import * as echarts from 'echarts'
  import { onMounted, ref, watch } from 'vue'
  
  const props = defineProps({
  rawData: Array,
  variety: String,
  broker: String,
  symbol: String,
  // 新增：默认展示全部三条线
  show: {
    type: Array,
    default: () => ['long', 'short', 'net']
  }
})
  
  const chart = ref(null);
  let instance = null;
  
  onMounted(() => {
    instance = echarts.init(chart.value)
    render()
  })
  
  watch(() => [props.rawData, props.variety, props.broker], render, {
    deep: true
  })

  const buildBrokerSeries = (data, variety, brokerName) => {
  return data.map(day => {
    console.log('day',day.positions)
    const pos = day.positions?.[props.symbol][variety];
    console.log('pos', pos);
    if (!pos) return null

    const longItem = pos.longPosition.find(i => i.broker === brokerName)
    const shortItem = pos.shortPosition?.find(i => i.broker === brokerName)

    return {
      date: day.date,
      long: longItem?.buy ?? 0,
      short: shortItem?.ss ?? 0,
      net: longItem?.net_position ?? 0
    }
  }).filter(Boolean);
}
function render() {
  if (!instance || !props.rawData) return

  const seriesData = buildBrokerSeries(
    props.rawData,
    props.variety,
    props.broker
  )

  // 1. 先定义好三条线的所有配置
  const allSeries = [
    {
      id: 'long',
      name: '多头',
      data: seriesData.map(i => i.long),
      color: '#f85149'
    },
    {
      id: 'short',
      name: '空头',
      data: seriesData.map(i => i.short),
      color: '#23d18b'
    },
    {
      id: 'net',
      name: '净持仓',
      data: seriesData.map(i => i.net),
      color: '#000'
    }
  ]

  // 2. 根据 props.show 过滤出需要显示的线
  const visibleSeries = allSeries
    .filter(item => props.show.includes(item.id))
    .map(item => ({
      name: item.name,
      type: 'line',
      smooth: true,
      symbolSize: 3,
      data: item.data,
      itemStyle: { color: item.color },
      lineStyle: { width: 2, color: item.color }
    }))

  const buildOption = (finalSeries) => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line' }
      },
      legend: {
        // 这里的 data 也要同步过滤，否则图例会显示多余项
        data: finalSeries.map(s => s.name),
        top: 10
      },
      grid: {
        left: 50,
        right: 30,
        top: 50,
        bottom: 40
      },
      xAxis: {
        type: 'category',
        data: seriesData.map(i => i.date),
        axisLine: { lineStyle: { color: '#ccc' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#eee' } }
      },
      series: finalSeries
    }
  }

  instance.setOption(buildOption(visibleSeries), true)
}
  </script>
  
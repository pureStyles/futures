<template>
  <div ref="chart" class="line-chart"></div>
</template>
  
  <script setup>
  import * as echarts from 'echarts'
  import { onMounted, onUnmounted, ref, watch } from 'vue'
  
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
  const resizeChart = () => instance?.resize();
  
  onMounted(() => {
    instance = echarts.init(chart.value)
    render()
    window.addEventListener('resize', resizeChart)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resizeChart)
    instance?.dispose()
  })
  
  watch(() => [props.rawData, props.variety, props.broker], render, {
    deep: true
  })

  const buildBrokerSeries = (data, variety, brokerName) => {
  return data.map(day => {
    const pos = day.positions?.[props.symbol]?.[variety];
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
      color: '#0f5fb7'
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
        top: 4,
        textStyle: { color: '#667085' }
      },
      grid: {
        left: 46,
        right: 16,
        top: 42,
        bottom: 34
      },
      xAxis: {
        type: 'category',
        data: seriesData.map(i => i.date),
        axisLine: { lineStyle: { color: '#d8e0ea' } },
        axisTick: { show: false },
        axisLabel: { color: '#667085' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#667085' },
        splitLine: { lineStyle: { color: '#eef2f7' } }
      },
      series: finalSeries
    }
  }

  instance.setOption(buildOption(visibleSeries), true)
}
  </script>

<style scoped>
.line-chart {
  width: 100%;
  height: 260px;
}
</style>
  

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
    symbol: String
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
  
    const series = buildBrokerSeries(
      props.rawData,
      props.variety,
      props.broker
    )

    const buildOption = (series) => {
        return {
            tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'line' }
            },
            legend: {
            data: ['多头', '空头', '净持仓'],
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
            data: series.map(i => i.date),
            axisLine: { lineStyle: { color: '#ccc' } },
            axisTick: { show: false }
            },
            yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: {
                lineStyle: {
                color: '#eee'
                }
            }
            },
            series: [
            {
                name: '多头',
                type: 'line',
                smooth: true,
                data: series.map(i => i.long)
            },
            {
                name: '空头',
                type: 'line',
                smooth: true,
                data: series.map(i => i.short)
            },
            {
                name: '净持仓',
                type: 'line',
                smooth: true,
                data: series.map(i => i.net)
            }
            ]
        }
    }
  
    instance.setOption(buildOption(series), true)
  }
  </script>
  
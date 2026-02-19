<template>
  <div class="heatmap-wrapper">
    <div 
      ref="chartRef" 
      class="heatmap-canvas" 
      :style="{ height: (props.data?.varieties?.length > 20) ? '800px' : '500px' }"
    ></div>
    <div v-if="props.data?.varieties?.length > 25" class="usage-tip">
      💡 提示：品种较多，可使用鼠标滚轮缩放或拖拽滚动条查看细节
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { ref, onMounted, watch, onUnmounted } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const chartRef = ref(null);
let myChart = null;

const renderChart = () => {
  if (!chartRef.value || !props.data) return;
  
  // 初始化实例
  if (!myChart) {
    myChart = echarts.init(chartRef.value);
  }

  const { varieties, correlation } = props.data;
  const isLargeData = varieties.length > 65;

  const option = {
    // 十字准星提示框
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(27, 31, 41, 0.9)',
      borderColor: '#444',
      textStyle: { color: '#fff' },
      formatter: (p) => {
        const val = p.data[2];
        return `<b>${varieties[p.data[0]]}</b> × <b>${varieties[p.data[1]]}</b><br/>相关性: ${val === null ? '自相关' : val}`;
      }
    },
    // 布局调整
    grid: {
      top: '1%',
      bottom: isLargeData ? '15%' : '10%', // 为滚动条留空间
      left: '2%',
      right: '5%',
      show: true,
      backgroundColor: '#fcfcfc',
      borderColor: '#eee'
    },
    xAxis: {
      type: 'category',
      data: varieties,
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        interval: 0 // 配合缩放，强制显示所有标签
      },
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: varieties,
      axisLabel: {
        fontSize: 10,
        interval: 0
      },
      splitArea: { show: true }
    },
    // 缩放组件：只有数据量大时才启用
    dataZoom: isLargeData ? [
      {
        type: 'slider',
        xAxisIndex: 0,
        start: 0,
        end: 100,
        bottom: '2%'
      },
      {
        type: 'slider',
        yAxisIndex: 0,
        left: 'right',
        start: 0,
        end: 100
      },
      {
        type: 'inside', // 开启滚轮缩放
        xAxisIndex: 0
      },
      {
        type: 'inside',
        yAxisIndex: 0
      }
    ] : [], // 数据量小时传空数组
    // 颜色映射
    visualMap: {
      min: -100,
      max: 100,
      calculable: true,
      orient: 'vertical',
      right: '0%',
      top: 'center',
      outOfRange: { color: '#ffffff' }, // 对角线 null 显示白色
      inRange: {
        // 蓝-白-红 经典配色
        color: ['#313695', '#abd9e9', '#ffffff', '#fdae61', '#a50026']
      }
    },
    series: [{
      name: 'Correlation',
      type: 'heatmap',
      data: correlation,
      label: {
        // 品种多时隐藏标签，放大后可看
        show: true,
        fontSize: 10,
        formatter: (p) => {
          const val = p.data[2];
          // 1. 如果是对角线(null)，不显示
          if (val === null) return '';
          
          // 2. 只有绝对值超过 60 的才显示数字（涵盖了正相关 > 60 和 负相关 < -60）
          // 如果你只想标出正相关，去掉 Math.abs 即可
          if (Math.abs(val) >= 60) {
            return val;
          }
          
          // 3. 其他数值返回空字符串，即不标注
          return '';
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          strokeColor: '#333',
          strokeWidth: 2
        }
      },
      itemStyle: {
        borderColor: '#eee',
        borderWidth: 0.5
      }
    }]
  };

  // 关键：使用 notMerge: true 彻底清除上一个板块的配置（如 dataZoom）
  myChart.setOption(option, true);
};

// 窗口自适应
const handleResize = () => {
  if (myChart) {
    myChart.resize();
  }
};

// 监听数据变化，立即重绘
watch(() => props.data, () => {
  renderChart();
}, { deep: true });

onMounted(() => {
  renderChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (myChart) {
    myChart.dispose();
  }
});
</script>

<style scoped>
.heatmap-wrapper {
  position: relative;
  background: #fff;
  width: 100%;
}

.heatmap-canvas {
  width: 100%;
  transition: height 0.3s ease; /* 高度切换时平滑一点 */
}

.usage-tip {
  margin-top: 10px;
  text-align: center;
  font-size: 12px;
  color: #999;
}
</style>
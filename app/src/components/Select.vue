<template>
    <div class="custom-select" :class="{ 'is-open': isOpen }" ref="selectRef">
      <div class="select-trigger" @click.stop="toggleSelect">
        <span :class="{ 'placeholder': !value }" style="color: #000;">
          {{ selectedLabel || placeholder }}
        </span>
        <div class="arrow-icon"></div>
      </div>
  
      <transition name="fade-slide">
        <div v-if="isOpen" class="select-options">
          <div
            v-for="option in options"
            :key="option[valueKey]"
            class="option-item"
            :class="{ 'is-selected': value === option[valueKey] }"
            @click="handleSelect(option)"
          >
            {{ option[labelKey] }}
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  
  // Vue 2.7 直接支持 defineProps 宏
  const props = defineProps({
    value: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    labelKey: String,
    valueKey: String
  });
  
  // Vue 2.7 中 defineEmits 也是可用的
  const emit = defineEmits(['input', 'change']); // Vue 2 默认 v-model 绑定的是 input 事件
  
  const isOpen = ref(false);
  const selectRef = ref(null);
  
  const selectedLabel = computed(() => {
    const selected = props.options.find(opt => opt[props.valueKey] === props.value);
    return selected ? selected[props.labelKey] : '';
  });
  
  const toggleSelect = () => {
    isOpen.value = !isOpen.value;
  };
  
  const handleSelect = (option) => {
    // 注意：Vue 2 的 v-model 默认监听 'input' 事件
    emit('input', option[props.valueKey]);
    emit('change', option[props.valueKey]);
    isOpen.value = false;
  };
  
  const handleClickOutside = (event) => {
    if (selectRef.value && !selectRef.value.contains(event.target)) {
      isOpen.value = false;
    }
  };
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
  </script>
  
  <style scoped>
  /* 保持简洁的外国 UI 风格 */
  .custom-select {
    width: 180px;
    position: relative;
    font-size: 14px;
    color: #ccd6f6;
  }
  
  .select-trigger {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s ease;
  }
  
  
  .arrow-icon {
    width: 8px;
    height: 8px;
    border-right: 2px solid #626a7e;
    border-bottom: 2px solid #626a7e;
    transform: rotate(45deg);
    transition: transform 0.3s ease;
    margin-bottom: 2px;
  }
  
  .is-open .arrow-icon {
    transform: rotate(-135deg);
    margin-bottom: -2px;
    border-color: #4e75ff;
  }
  
  .select-options {
    max-height: 300px;
    overflow: auto;
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: #1b1f29;
    border: 1px solid #2d3343;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    padding: 4px;
  }
  
  .option-item {
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .option-item:hover {
    background: #242936;
  }
  
  .option-item.is-selected {
    background: rgba(78, 117, 255, 0.15);
  }
  
  /* 简单的动画 */
  .fade-slide-enter-active, .fade-slide-leave-active {
    transition: all 0.2s ease;
  }
  .fade-slide-enter, .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
  </style>
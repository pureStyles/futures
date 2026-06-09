<template>
    <div class="custom-select" :class="{ 'is-open': isOpen }" ref="selectRef">
      <div
        class="select-trigger"
        tabindex="0"
        @click.stop="toggleSelect"
        @keydown.enter.prevent="toggleSelect"
        @keydown.esc.prevent="closeSelect"
      >
        <input
          v-if="isOpen"
          ref="inputRef"
          type="text"
          class="search-input"
          v-model="searchQuery"
          :placeholder="selectedLabel || placeholder"
          @click.stop
          @keydown.esc.prevent="closeSelect"
        />
        <span v-else :class="{ 'placeholder': !value }" class="trigger-label">
          {{ selectedLabel || placeholder }}
        </span>
        <div class="arrow-icon"></div>
      </div>
  
      <transition name="fade-slide">
        <div v-if="isOpen" class="select-options">
          <div
            v-for="option in filteredOptions"
            :key="option[valueKey]"
            class="option-item"
            :class="{ 'is-selected': value === option[valueKey] }"
            @click="handleSelect(option)"
          >
            {{ option[labelKey] }}
          </div>
          <div v-if="filteredOptions.length === 0" class="no-data">
            无匹配结果
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
  
  const props = defineProps({
    value: [String, Number],
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: '请选择' },
    labelKey: { type: String, default: 'label' },
    valueKey: { type: String, default: 'value' }
  });
  
  const emit = defineEmits(['input', 'change']);
  
  const isOpen = ref(false);
  const selectRef = ref(null);
  const inputRef = ref(null);
  const searchQuery = ref(''); // 搜索关键词
  
  // 1. 获取选中的 Label (用于回显)
  const selectedLabel = computed(() => {
    const selected = props.options.find(opt => opt[props.valueKey] === props.value);
    return selected ? selected[props.labelKey] : '';
  });
  
  // 2. 本地搜索过滤逻辑
  const filteredOptions = computed(() => {
    if (!searchQuery.value) return props.options;
    const query = searchQuery.value.toLowerCase();
    return props.options.filter(opt => 
      opt[props.labelKey].toString().toLowerCase().includes(query)
    );
  });
  
  const toggleSelect = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      searchQuery.value = ''; // 每次打开重置搜索词，确保看到全部
      nextTick(() => {
        inputRef.value?.focus(); // 自动聚焦搜索框
      });
    }
  };
  
  const closeSelect = () => {
    isOpen.value = false;
    searchQuery.value = '';
  };

  const handleSelect = (option) => {
    emit('input', option[props.valueKey]);
    emit('change', option[props.valueKey]);
    closeSelect();
  };
  
  const handleClickOutside = (event) => {
    if (selectRef.value && !selectRef.value.contains(event.target)) {
      closeSelect();
    }
  };
  
  onMounted(() => document.addEventListener('click', handleClickOutside));
  onUnmounted(() => document.removeEventListener('click', handleClickOutside));
  </script>
  
  <style scoped>
  .custom-select {
    width: 190px;
    position: relative;
    font-size: 14px;
  }
  
  .select-trigger {
    border: 1px solid #d8e0ea;
    border-radius: 8px;
    padding: 0 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    height: 40px;
    box-sizing: border-box;
    transition: border-color 0.16s ease, box-shadow 0.16s ease;
  }

  .select-trigger:hover,
  .select-trigger:focus {
    border-color: #8bb7e8;
    box-shadow: 0 0 0 3px rgba(15, 95, 183, 0.08);
    outline: none;
  }
  
  .trigger-label {
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .search-input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    padding: 0;
    font-size: 14px;
    color: #1a1a1a;
  }
  
  .search-input::placeholder {
    color: #8892b0;
  }
  
  .select-options {
    max-height: 250px;
    overflow-y: auto;
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: #fff; /* 统一白底风格 */
    border: 1px solid #dfe7f1;
    border-radius: 8px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
    z-index: 1000;
    padding: 4px;
  }
  
  .option-item {
    padding: 9px 10px;
    border-radius: 6px;
    cursor: pointer;
    color: #333;
    transition: all 0.2s;
  }
  
  .option-item:hover {
    background: #f5f7fa;
  }
  
  .option-item.is-selected {
    background: #e9f2ff;
    color: #0f5fb7;
    font-weight: 700;
  }
  
  .no-data {
    padding: 12px;
    color: #999;
    text-align: center;
    font-size: 12px;
  }
  
  .arrow-icon {
    width: 6px;
    height: 6px;
    border-right: 2px solid #999;
    border-bottom: 2px solid #999;
    transform: rotate(45deg);
    transition: transform 0.3s ease;
    flex-shrink: 0;
    margin-left: 8px;
  }
  
  .is-open .arrow-icon {
    transform: rotate(-135deg);
  }
  
  .fade-slide-enter-active, .fade-slide-leave-active {
    transition: all 0.2s ease;
  }
  .fade-slide-enter, .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-5px);
  }
  </style>

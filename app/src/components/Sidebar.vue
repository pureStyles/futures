<template>
    <div class="sidebar">
      <div 
        class="menu-header" 
        :class="{ 'open': isExpanded }" 
        @click="toggleMenu"
      >
        商品 <span class="arrow"></span>
      </div>
  
      <div class="collapsible-wrapper" :class="{ 'expanded': isExpanded }">
        <ul class="menu-list">
          <li v-for="(item, index) in VARIETIES_LIST" :key="index">
            <router-link :to="{ name: 'varietyDetail', params: { variety: item.code } }">
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { VARIETIES_LIST } from '@/config/varieties';
  import { ref } from 'vue';
  
  // 定义展开状态
  const isExpanded = ref(true); 
  
  // 切换逻辑
  const toggleMenu = () => {
    isExpanded.value = !isExpanded.value;
  };
  </script>
  
  <style scoped>
  .sidebar {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    max-width: 300px;
    background-color: transparent; /* 改为透明以适配你的背景 */
    user-select: none;
  }
  
  /* 标题栏 */
  .menu-header {
    font-size: 24px;
    font-weight: 300;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: color 0.3s;
  }
  
  /* 箭头动效 */
  .arrow {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-right: 1.5px solid #1a1a1a;
    border-bottom: 1.5px solid #1a1a1a;
    transform: rotate(45deg); /* 默认向下 */
    margin-left: 12px;
    margin-top: -4px;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* 展开时箭头旋转 */
  .menu-header.open .arrow {
    transform: rotate(-135deg);
    margin-top: 4px;
  }
  
  /* --- 折叠动画核心 --- */
  .collapsible-wrapper {
    max-height: 0;
    overflow: hidden;
    /* cubic-bezier 曲线让收起更自然 */
    transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
  }
  
  .collapsible-wrapper.expanded {
    max-height: 2000px; /* 足够容纳列表的高度即可 */
    transition: max-height 0.8s cubic-bezier(1, 0, 1, 0);
  }
  
  /* 菜单列表样式 */
  .menu-list {
    list-style: none;
    padding: 20px 0 0 0;
    margin: 0;
  }
  
  .menu-list li {
    margin-bottom: 22px;
  }
  
  .menu-list a {
    text-decoration: none;
    font-size: 20px;
    font-weight: 300;
    color: #1a1a1a;
    display: block;
    transition: all 0.2s ease;
  }
  
  .menu-list a:hover {
    opacity: 0.5;
    padding-left: 5px; /* 轻微位移增加灵动感 */
  }
  
  /* 红色特殊标记项 */
  .sale-item {
    color: #e55e4d !important;
    margin-top: 15px;
  }
  </style>
<template>
    <div class="sidebar">
      <div
        v-for="menu in MENU_LIST"
        :key="menu.key"
        class="menu-block"
      >
        <!-- 一级标题 -->
        <div
          class="menu-header"
          :class="{ open: openMap[menu.key] }"
          @click="toggle(menu.key)"
        >
          {{ menu.name }}
          <span class="arrow"></span>
        </div>
  
        <!-- 二级菜单 -->
        <div
          class="collapsible-wrapper"
          :class="{ expanded: openMap[menu.key] }"
        >
          <ul class="menu-list">
            <li
              v-for="child in menu.children"
              :key="child.key"
            >
              <router-link :to="child.route">
                {{ child.name }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup>
    import { ref } from 'vue';
    import { MENU_LIST } from '@/config/sideBar';
    
    const openMap = ref({});
    
    // 默认全部展开（也可以只展开第一个）
    MENU_LIST.forEach(menu => {
      openMap.value[menu.key] = true;
    });
    
    const toggle = (key) => {
      openMap.value[key] = !openMap.value[key];
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
    max-height: 400px;
    list-style: none;
    padding: 20px 0 0 0;
    margin: 0;

    overflow-y: auto;
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
  }
  
  /* 红色特殊标记项 */
  .sale-item {
    color: #e55e4d !important;
    margin-top: 15px;
  }

  /* 1. 设置整个滚动条的宽度 */
::-webkit-scrollbar {
  width: 6px;  /* 纵向滚动条宽度 */
  height: 6px; /* 横向滚动条高度 */
}

/* 2. 滚动条轨道 (背景) */
::-webkit-scrollbar-track {
  background: #f1f1f1; 
  border-radius: 10px;
}

/* 3. 滚动条滑块 (移动部分) */
::-webkit-scrollbar-thumb {
  background: #888; 
  border-radius: 10px; /* 圆角让它看起来更精致 */
}

/* 4. 滑块悬停时的颜色 */
::-webkit-scrollbar-thumb:hover {
  background: #555; 
}
  </style>
<template>
  <nav class="sidebar">
    <div class="brand">
      <div class="brand-mark">FM</div>
      <div>
        <div class="brand-title">期货监控台</div>
        <div class="brand-subtitle">Position Intelligence</div>
      </div>
    </div>

    <div class="nav-scroll">
      <section
        v-for="menu in MENU_LIST"
        :key="menu.key"
        class="menu-block"
      >
        <button
          class="menu-header"
          :class="{ open: openMap[menu.key] }"
          type="button"
          @click="toggle(menu.key)"
        >
          <span>{{ menu.name }}</span>
          <span class="arrow"></span>
        </button>

        <div class="collapsible-wrapper" :class="{ expanded: openMap[menu.key] }">
          <router-link
            v-for="child in menu.children"
            :key="child.key"
            class="menu-link"
            active-class="active"
            exact-active-class="active"
            :to="child.route"
          >
            <span class="link-dot"></span>
            <span>{{ child.name }}</span>
          </router-link>
        </div>
      </section>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { MENU_LIST } from '@/config/sideBar';

const openMap = ref({});

MENU_LIST.forEach(menu => {
  openMap.value[menu.key] = true;
});

const toggle = (key) => {
  openMap.value[key] = !openMap.value[key];
};
</script>

<style scoped>
.sidebar {
  height: 100%;
  padding: 22px 16px;
  user-select: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 22px;
  border-bottom: 1px solid #edf1f7;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #111827;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}

.brand-title {
  color: #111827;
  font-size: 17px;
  font-weight: 800;
}

.brand-subtitle {
  margin-top: 2px;
  color: #7a8699;
  font-size: 11px;
}

.nav-scroll {
  height: calc(100vh - 108px);
  overflow-y: auto;
  padding: 18px 4px 8px;
}

.menu-block + .menu-block {
  margin-top: 16px;
}

.menu-header {
  width: 100%;
  border: 0;
  background: transparent;
  color: #6b7280;
  padding: 8px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
}

.arrow {
  width: 7px;
  height: 7px;
  border-right: 1.5px solid #94a3b8;
  border-bottom: 1.5px solid #94a3b8;
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.menu-header.open .arrow {
  transform: rotate(-135deg);
}

.collapsible-wrapper {
  display: grid;
  gap: 4px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.25s ease;
}

.collapsible-wrapper.expanded {
  max-height: 360px;
}

.menu-link {
  min-height: 38px;
  padding: 0 10px;
  border-radius: 8px;
  color: #344054;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.16s ease, color 0.16s ease;
}

.menu-link:hover {
  background: #f3f6fb;
  color: #111827;
}

.menu-link.active {
  background: #e9f2ff;
  color: #0f5fb7;
}

.link-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1px solid currentColor;
  opacity: 0.7;
}

.menu-link.active .link-dot {
  background: currentColor;
}

.nav-scroll::-webkit-scrollbar {
  width: 6px;
}

.nav-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
}

@media (max-width: 960px) {
  .sidebar {
    padding: 14px;
  }

  .brand {
    padding-bottom: 14px;
  }

  .nav-scroll {
    height: auto;
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 12px 0 2px;
  }

  .menu-block {
    min-width: 210px;
  }
}
</style>

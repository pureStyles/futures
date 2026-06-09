<template>
  <div id="app">
    <aside class="app-sidebar">
      <Sidebar />
    </aside>
    <main class="app-main">
      <header class="app-header">
        <div>
          <div class="eyebrow">Futures Monitor</div>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageDesc }}</p>
        </div>
        <div class="status-strip">
          <div class="status-item">
            <span>最新交易日</span>
            <strong>{{ latestDate || '--' }}</strong>
          </div>
          <div class="status-item">
            <span>数据源</span>
            <strong>本地快照</strong>
          </div>
        </div>
      </header>
      <div class="content-shell">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from './components/Sidebar';

export default {
  name: 'App',
  components: {
    Sidebar
  },
  data() {
    return {
      latestDate: ''
    };
  },
  computed: {
    pageTitle() {
      return this.$route.meta?.title || '期货数据跟踪';
    },
    pageDesc() {
      return this.$route.meta?.desc || '追踪品种、席位和资金结构的每日变化。';
    }
  },
  mounted() {
    fetch('./data/position.json')
      .then(res => res.json())
      .then(data => {
        this.latestDate = data[data.length - 1]?.date || '';
      })
      .catch(() => {
        this.latestDate = '';
      });
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  background: #f5f7fb;
  color: #172033;
}

.app-sidebar {
  position: sticky;
  top: 0;
  width: 272px;
  height: 100vh;
  flex-shrink: 0;
  border-right: 1px solid #e1e7ef;
  background: #ffffff;
}

.app-main {
  min-width: 0;
  flex: 1;
  padding: 28px;
}

.app-header {
  min-height: 116px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}

.eyebrow {
  color: #5f6f89;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  margin: 6px 0 8px;
  color: #111827;
  font-size: 30px;
  line-height: 1.15;
  letter-spacing: 0;
}

p {
  margin: 0;
  max-width: 620px;
  color: #5f6f89;
  font-size: 14px;
  line-height: 1.7;
}

.status-strip {
  display: flex;
  gap: 10px;
}

.status-item {
  min-width: 128px;
  padding: 12px 14px;
  border: 1px solid #e1e7ef;
  border-radius: 8px;
  background: #ffffff;
}

.status-item span {
  display: block;
  color: #6b7280;
  font-size: 12px;
}

.status-item strong {
  display: block;
  margin-top: 6px;
  color: #172033;
  font-size: 14px;
}

.content-shell {
  min-width: 0;
}

@media (max-width: 960px) {
  #app {
    display: block;
  }

  .app-sidebar {
    position: static;
    width: 100%;
    height: auto;
  }

  .app-main {
    padding: 18px;
  }

  .app-header {
    display: block;
  }

  .status-strip {
    margin-top: 16px;
    overflow-x: auto;
  }
}
</style>

<style>
  html,
  body {
    margin: 0;
    min-height: 100%;
    background: #f5f7fb;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  select {
    font: inherit;
  }
</style>

<template>
  <div class="dashboard">
    <section class="metrics-grid">
      <div class="metric-card">
        <span>最新交易日</span>
        <strong>{{ latestDate || '--' }}</strong>
        <small>持仓快照</small>
      </div>
      <div class="metric-card">
        <span>覆盖品种</span>
        <strong>{{ varietyCount }}</strong>
        <small>主力/次主力合约</small>
      </div>
      <div class="metric-card">
        <span>盈亏样本</span>
        <strong>{{ profitVarietyCount }}</strong>
        <small>近一年与近半年</small>
      </div>
      <div class="metric-card">
        <span>重点席位</span>
        <strong>{{ brokerCount }}</strong>
        <small>席位结构快照</small>
      </div>
    </section>

    <section class="dashboard-grid">
      <div class="panel wide">
        <div class="panel-header">
          <div>
            <h2>净持仓异动</h2>
            <p>按最新交易日相对上一交易日的净持仓变化排序。</p>
          </div>
          <router-link class="panel-action" :to="{ name: 'position' }">查看持仓</router-link>
        </div>

        <div class="table-list">
          <router-link
            v-for="item in positionMovers"
            :key="item.symbol"
            class="table-row"
            :to="{ name: 'position', params: { variety: item.symbol } }"
          >
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.symbol }}</span>
            </div>
            <div class="row-value" :class="{ down: item.change < 0 }">
              {{ formatSigned(item.change) }}
            </div>
            <div class="row-muted">净持仓 {{ formatNumber(item.net) }}</div>
          </router-link>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>近半年盈利席位</h2>
            <p>取各品种半年度盈亏榜首席位。</p>
          </div>
        </div>
        <div class="rank-list">
          <router-link
            v-for="item in profitLeaders"
            :key="item.symbol + item.broker"
            class="rank-item"
            :to="{ name: 'brokerFundFlow', query: { broker: item.broker, variety: item.symbol } }"
          >
            <span>{{ item.name }}</span>
            <strong>{{ item.broker }}</strong>
            <em>{{ formatMoney(item.value) }}</em>
          </router-link>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>快捷分析</h2>
            <p>直接进入最常用的三类观察视角。</p>
          </div>
        </div>
        <div class="quick-actions">
          <router-link :to="{ name: 'netPosition' }">席位雷达</router-link>
          <router-link :to="{ name: 'correlation' }">品种相关性</router-link>
          <router-link :to="{ name: 'correlationPosition' }">强相关持仓</router-link>
          <router-link :to="{ name: 'brokerFundFlow' }">资金动向</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { VARIETIES_LIST } from '@/config/varieties';

export default {
  name: 'Dashboard',
  data() {
    return {
      positionData: [],
      profitData: {},
      brokerStructure: {}
    };
  },
  computed: {
    latestDay() {
      return this.positionData[this.positionData.length - 1] || null;
    },
    previousDay() {
      return this.positionData[this.positionData.length - 2] || null;
    },
    latestDate() {
      return this.latestDay?.date || '';
    },
    varietyCount() {
      return VARIETIES_LIST.length;
    },
    profitVarietyCount() {
      return Object.keys(this.profitData).length;
    },
    brokerCount() {
      return Math.max(0, Object.keys(this.brokerStructure).length - 1);
    },
    positionMovers() {
      if (!this.latestDay || !this.previousDay) return [];

      return VARIETIES_LIST.map(variety => {
        const net = this.getNetPosition(this.latestDay, variety.symbol);
        const previousNet = this.getNetPosition(this.previousDay, variety.symbol);
        return {
          name: variety.name,
          symbol: variety.symbol,
          net,
          change: net - previousNet
        };
      })
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 8);
    },
    profitLeaders() {
      return VARIETIES_LIST.map(variety => {
        const leader = this.profitData[variety.symbol]?.half_year?.[0];
        if (!leader) return null;
        return {
          name: variety.name,
          symbol: variety.symbol,
          broker: leader.broker,
          value: leader.value
        };
      })
        .filter(Boolean)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    }
  },
  mounted() {
    Promise.all([
      fetch('./data/position.json').then(res => res.json()),
      fetch('./data/profit.json').then(res => res.json()),
      fetch('./data/brokerStructure.json').then(res => res.json())
    ]).then(([positionData, profitData, brokerStructure]) => {
      this.positionData = positionData;
      this.profitData = profitData;
      this.brokerStructure = brokerStructure;
    });
  },
  methods: {
    getNetPosition(day, symbol) {
      const rows = day.positions?.[symbol]?.all?.longPosition || [];
      return rows.reduce((sum, item) => sum + (Number(item.net_position) || 0), 0);
    },
    formatNumber(value) {
      return Number(value || 0).toLocaleString('zh-CN');
    },
    formatSigned(value) {
      const number = Number(value || 0);
      const prefix = number > 0 ? '+' : '';
      return `${prefix}${this.formatNumber(number)}`;
    },
    formatMoney(value) {
      return `${(Number(value || 0) / 100000000).toFixed(2)} 亿`;
    }
  }
};
</script>

<style scoped>
.dashboard {
  display: grid;
  gap: 18px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.metric-card,
.panel {
  border: 1px solid #e1e7ef;
  border-radius: 8px;
  background: #ffffff;
}

.metric-card {
  min-height: 118px;
  padding: 18px;
}

.metric-card span,
.metric-card small,
.panel p,
.table-row span,
.row-muted {
  color: #667085;
}

.metric-card span,
.metric-card small {
  display: block;
  font-size: 12px;
}

.metric-card strong {
  display: block;
  margin: 12px 0 8px;
  color: #111827;
  font-size: 28px;
  line-height: 1;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
  gap: 18px;
}

.panel {
  padding: 18px;
}

.panel.wide {
  grid-row: span 2;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

h2 {
  margin: 0 0 6px;
  color: #111827;
  font-size: 18px;
  letter-spacing: 0;
}

p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

.panel-action {
  white-space: nowrap;
  color: #0f5fb7;
  font-size: 13px;
  font-weight: 700;
}

.table-list,
.rank-list,
.quick-actions {
  display: grid;
  gap: 8px;
}

.table-row {
  min-height: 58px;
  padding: 10px 12px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 18px;
  transition: border-color 0.16s ease, background 0.16s ease;
}

.table-row:hover,
.rank-item:hover,
.quick-actions a:hover {
  border-color: #bfd7f5;
  background: #f7fbff;
}

.table-row strong,
.rank-item strong {
  display: block;
  color: #111827;
  font-size: 14px;
}

.table-row span {
  display: block;
  margin-top: 3px;
  font-size: 12px;
}

.row-value {
  color: #c2410c;
  font-weight: 800;
}

.row-value.down {
  color: #047857;
}

.row-muted {
  font-size: 12px;
  text-align: right;
}

.rank-item,
.quick-actions a {
  border: 1px solid #eef2f7;
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.16s ease, background 0.16s ease;
}

.rank-item {
  display: grid;
  grid-template-columns: 74px 1fr auto;
  align-items: center;
  gap: 10px;
}

.rank-item span,
.rank-item em {
  color: #667085;
  font-size: 12px;
  font-style: normal;
}

.quick-actions {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.quick-actions a {
  min-height: 54px;
  display: flex;
  align-items: center;
  color: #111827;
  font-weight: 700;
}

@media (max-width: 1180px) {
  .metrics-grid,
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel.wide {
    grid-row: auto;
    grid-column: span 2;
  }
}

@media (max-width: 720px) {
  .metrics-grid,
  .dashboard-grid,
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .panel.wide {
    grid-column: auto;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .row-muted {
    text-align: left;
  }
}
</style>

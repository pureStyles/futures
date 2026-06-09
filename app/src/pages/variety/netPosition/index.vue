<template>
  <div class="radar-workspace">
    <section class="toolbar">
      <div>
        <h2>{{ varietyName }} 席位雷达</h2>
        <p>把同一品种下的强势席位和反向席位并排展示，快速判断跟随或反向观察对象。</p>
      </div>
      <Select
        v-model="selectedSymbol"
        :options="VARIETIES_LIST"
        labelKey="name"
        valueKey="symbol"
        placeholder="商品"
      />
    </section>

    <section class="panel">
      <SeatRadarView :currentVariety="selectedSymbol" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router/composables';
import { VARIETIES_LIST } from '@/config/varieties';
import SeatRadarView from '../components/SeatRadarView.vue';

const route = useRoute();
const selectedSymbol = ref(route.params.variety || 'RB');

watch(
  () => route.params.variety,
  (symbol) => {
    if (symbol) selectedSymbol.value = symbol;
  }
);

const varietyName = computed(() => {
  return VARIETIES_LIST.find(e => e.symbol === selectedSymbol.value)?.name || selectedSymbol.value;
});
</script>

<style scoped>
.radar-workspace {
  display: grid;
  gap: 18px;
}

.toolbar,
.panel {
  border: 1px solid #e1e7ef;
  border-radius: 8px;
  background: #ffffff;
}

.toolbar {
  min-height: 88px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.panel {
  padding: 18px;
}

h2,
p {
  margin: 0;
}

h2 {
  color: #111827;
  font-size: 22px;
  letter-spacing: 0;
}

p {
  margin-top: 6px;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 820px) {
  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>

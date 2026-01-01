import Vue from 'vue'
import App from './App.vue'
import router from './router';

import BaseSelect from '@/components/Select.vue';


Vue.config.productionTip = false

Vue.component('Select', BaseSelect);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

import Vue from 'vue'
import Router from 'vue-router'

import Variety from '../pages/variety/index.vue'
import Broker from '../pages/broker/index.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash', // ⚠️ GitHub Pages 必须用 hash
  routes: [
    {
      path: '/',
      redirect: '/variety'
    },
    {
      path: '/variety',
      name: 'variety',
      component: { render: (e) => e('router-view') },
      children: [
        {
            path: ':variety',
            name: 'varietyDetail',
            component: Variety
        }
      ]
    },
    {
      path: '/broker',
      name: 'broker',
      component: Broker
    }
  ]
})

import Vue from 'vue'
import Router from 'vue-router'

// 导入你的页面组件
import Variety from '../pages/variety/index.vue' // 原有的品种详情
import Broker from '../pages/broker/index.vue'   // 假设这是席位详情

Vue.use(Router)

export default new Router({
  mode: 'hash', 
  routes: [
    {
      path: '/',
      redirect: '/commodity/position/RB' // 默认跳转到一个品种，比如螺纹钢 RB
    },
    // --- 商品相关路由 ---
    {
      path: '/commodity',
      component: { render: (e) => e('router-view') },
      children: [
        {
          path: 'position/:variety?', // 对应持仓详情，接收品种参数
          name: 'positionDetail',
          component: Variety
        }
      ]
    },
    // --- 席位相关路由 ---
    {
      path: '/seat',
      component: { render: (e) => e('router-view') },
      children: [
        {
          path: 'core/:broker?', // 重点席位，broker 为可选参数
          name: 'coreSeatPosition',
          component: Broker 
        },
        {
          path: 'fund',
          name: 'seatFundFlow',
        //   component: () => import('../pages/seat/FundFlow.vue') // 示例：按需加载
        },
        {
          path: 'structure',
          name: 'positionStructure',
        //   component: () => import('../pages/seat/Structure.vue')
        }
      ]
    }
  ]
})
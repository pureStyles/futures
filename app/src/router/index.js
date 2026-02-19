import Vue from 'vue'
import Router from 'vue-router'

// 导入你的页面组件
import position from '../pages/variety/position' // 原有的品种详情
import netPosition from '../pages/variety/netPosition'
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
          name: 'position',
          component: position
        },
        {
            path: 'netPosition/:variety?',
            name: 'netPosition',
            component: netPosition,
        },
        {
            path: 'correlation',
            name: 'correlation',
            component: () => import('../pages/variety/correlation') // 示例：按需加载
        }
      ]
    },
    // --- 席位相关路由 ---
    {
      path: '/broker',
      component: { render: (e) => e('router-view') },
      children: [
        {
          path: 'core/:broker?', // 重点席位，broker 为可选参数
          name: 'coreSeatPosition',
          component: Broker 
        },
        {
          path: 'fund',
          name: 'brokerFundFlow',
          component: () => import('../pages/broker/fundFlow/index') // 示例：按需加载
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
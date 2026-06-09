import Vue from 'vue'
import Router from 'vue-router'

import Dashboard from '../pages/dashboard/index.vue'
import position from '../pages/variety/position' // 原有的品种详情
import netPosition from '../pages/variety/netPosition'
import Broker from '../pages/broker/index.vue'   // 假设这是席位详情
import brokerFundFlow from '../pages/broker/fundFlow/index.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash', 
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        title: '市场总览',
        desc: '从最新交易日数据里快速定位品种、席位和资金异动。'
      }
    },
    // --- 商品相关路由 ---
    {
      path: '/commodity',
      component: { render: (e) => e('router-view') },
      children: [
        {
          path: 'position/:variety?', // 对应持仓详情，接收品种参数
          name: 'position',
          component: position,
          meta: {
            title: '品种持仓详情',
            desc: '查看代表性席位盈亏和核心席位在主力合约上的净持仓演变。'
          }
        },
        {
            path: 'netPosition/:variety?',
            name: 'netPosition',
            component: netPosition,
            meta: {
              title: '席位多维雷达',
              desc: '按品种识别持续盈利席位和反向指标席位。'
            }
        },
        {
            path: 'correlation',
            name: 'correlation',
            component: () => import('../pages/variety/correlation'),
            meta: {
              title: '品种相关性',
              desc: '按板块查看品种之间的相关性强弱和聚集关系。'
            }
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
          component: Broker,
          meta: {
            title: '席位持仓工作台',
            desc: '聚焦单个席位的净市值分布、当日变化和重点品种。'
          }
        },
        {
          path: 'fund',
          name: 'brokerFundFlow',
          component: brokerFundFlow,
          meta: {
            title: '席位资金动向',
            desc: '拆解席位在不同商品上的资金结构和净市值变化。'
          }
        },
        {
          path: 'correlationPosition',
          name: 'correlationPosition',
          component: () => import('../pages/broker/correlationPosition/index'),
          meta: {
            title: '强相关持仓',
            desc: '查看席位强相关品种簇，辅助判断组合风险。'
          }
        },
        {
          path: 'structure',
          name: 'positionStructure',
          redirect: { name: 'brokerFundFlow' }
        }
      ]
    }
  ]
})

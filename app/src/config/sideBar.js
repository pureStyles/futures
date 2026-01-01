export const MENU_LIST = [
    {
      key: 'commodity',
      name: '商品',
      children: [
        {
          key: 'position',
          name: '持仓详情',
          // 关键：由于路由定义了 :variety 参数，这里可以默认传一个品种
          route: {
            name: 'positionDetail',
          }
        }
      ]
    },
    {
      key: 'seat',
      name: '席位',
      children: [
        {
          key: 'core-seat',
          name: '重点席位持仓',
          route: { name: 'coreSeatPosition' }
        },
        {
          key: 'seat-fund',
          name: '席位资金动向',
          route: { name: 'seatFundFlow' }
        },
        {
          key: 'position-structure',
          name: '持仓结构',
          route: { name: 'positionStructure' }
        }
      ]
    }
  ];
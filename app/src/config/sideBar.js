export const MENU_LIST = [
    {
      key: 'commodity',
      name: '商品',
      children: [
        {
          key: 'position',
          name: '持仓详情',
          route: {
            name: 'position',
          }
        },
        {
            key: 'netPosition',
            name: '净持仓',
            route: {
              name: 'netPosition',
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
          key: 'broker-fund',
          name: '席位资金动向',
          route: { name: 'brokerFundFlow' }
        },
        {
          key: 'position-structure',
          name: '持仓结构',
          route: { name: 'positionStructure' }
        }
      ]
    }
  ];
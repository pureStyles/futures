const request = require("../utils/request/index");

/** 查询所有品种的净市值 */
async function queryBrokerStructure(params) {
    return request.post('/ajax/broker_structure.php', params);
}

/** 查询席位持仓列表 */
async function queryBrokerPositions(params) {
    return request.post('/ajax/broker_positions.php', params);
}

/** 查询席位的净持仓市值 */
async function queryBrokerNetValue(params) {
    return request.post('/ajax/broker_structure_table.php', params);
}

module.exports = {
    queryBrokerStructure,
    queryBrokerPositions,
    queryBrokerNetValue
}
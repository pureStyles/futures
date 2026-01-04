const request = require("../utils/request/index");

/** 查询所有品种的净市值 */
async function queryBrokerStructure(params) {
    return request.post('/ajax/broker_structure.php', params);
}

module.exports = {
    queryBrokerStructure,
}
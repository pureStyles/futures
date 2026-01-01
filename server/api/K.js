const request = require("../utils/request/index");


/** 查询K线数据 */
async function queryK(params) {
    return request.post('/ajax/variety_net_position.php', params);
}

module.exports = {
    queryK,
}
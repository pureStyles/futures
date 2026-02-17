const request = require("../utils/request/index");

async function queryNetPositon(params) {
    return request.post("/ajax/net_position_list.php", params);
}


/** 查询持仓数据，报错多头和空头，据此也可以计算出净持仓 */
async function queryVarietyPostion(params) {
    return request.post("/ajax/variety_position.php", params);
}

/**  查询席位盈亏数据 */
async function queryVarietyProfit(params) {
    return request.post('/ajax/variety_profit_loss.php', params);
}

/** 查询主力合约 */
async function queryMainVarieies(params) {
    return request.post('/ajax/recent_contracts.php', params);
}

/** 查询品种之间的相关性关系 */
async function queryVarietyCorrelation(params) {
    return request.post('/ajax/variety_correlation.php', params);
}

module.exports = {
    queryNetPositon,
    queryVarietyPostion,
    queryVarietyProfit,
    queryMainVarieies,
    queryVarietyCorrelation,
}
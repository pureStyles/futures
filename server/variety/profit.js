
const { queryVarietyProfit } = require("../api/variety.js");

async function fetchVarietyProfitData(name, dates) {
    try {
        const data = await queryVarietyProfit({
            variety: name,
            date1: dates[0],
            date2: dates[1],
        });
        return data;
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    fetchVarietyProfitData,
}



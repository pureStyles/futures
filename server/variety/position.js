const moment = require("moment");
const { queryVarietyPostion } = require("../api/variety.js");
const { getNearestWeekday } = require("../utils/date.js");

async function fetchVarietyPositionData(varietyCode, date) {
    try {
        const data = await queryVarietyPostion({
            code: varietyCode,
            date,
        });
        return {
            longPosition: data.buy || [],
            shortPosition: data.ss || [],
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    fetchVarietyPositionData
}



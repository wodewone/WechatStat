const volume = require("../volume");
const fear = require("../fear");
module.exports = market = {
    async getData(limit) {
        const [_vol, _fear] = await Promise.all([
            volume.getData(limit).catch(() => []),
            fear.getData(limit).catch(() => [])
        ]);
        return {
            volume: _vol,
            fear: _fear
        }
    },
    async getChartData(limit) {
        const [_vol, _fear] = await Promise.all([
            volume.getChartData(limit).catch(() => []),
            fear.getChartData(limit).catch(() => [])
        ]);
        return [..._vol, ..._fear];
    },
};
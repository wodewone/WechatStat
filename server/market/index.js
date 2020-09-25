module.exports = market = {
    async getChartData(limit) {
        const volume = require("../volume");
        const fear = require("../fear");
        const [_vol, _fear] = await Promise.all([
            volume.getChartData(limit).catch(() => []),
            fear.getChartData(limit).catch(() => [])
        ]);
        return [..._vol, ..._fear];
    },
};
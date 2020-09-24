module.exports = market = {
    async getChartData(limit) {
        const volume = require("../volume");
        const fear = require("../fear");
        const {handlerChartData} = require('../../plugin/utils');

        const [_vol, _fear] = await Promise.all([
            volume.getChartData(limit).catch(() => []),
            fear.getChartData(limit).catch(() => [])
        ]);
        const _v = _vol.length ? handlerChartData(_vol, {x: 'date', y: 'ave', type: 'Vol'}) : [];
        const _f = _fear.length ? handlerChartData(_fear, {x: 'date', y: 'value', type: 'Fear and Greed Index'}) : [];
        return [..._v, ..._f];
    },
    async getImg(limit) {
        const {getChartImg} = require('../../plugin/utils');
        const _l = await this.getChartData(limit);
        return getChartImg(_l);
    }
};
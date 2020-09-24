module.exports = {
    async getChartData(limit) {
        const Database = require('../../plugin/database');
        const db = new Database();
        return db.queryData(limit).catch(() => ([]));
    },
    async getImg(limit) {
        const {getChartImg, handlerChartData} = require('../../plugin/utils');
        const _d = await this.getChartData(limit);
        const _l = handlerChartData(_d, {x: 'date', y: 'ave', type: 'Vol'});
        return getChartImg(_l);
    }
};
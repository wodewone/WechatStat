const {handlerChartData} = require('../mixins');
const Database = require('../../plugin/database');
const db = new Database();

module.exports = {
    async getData(limit) {
        return db.queryData(limit).catch(() => ([]));
    },
    async getChartData(limit) {
        const _d = await this.getData(limit);
        return handlerChartData(_d, {x: 'date', y: 'ave', type: 'Vol'});
    },
};
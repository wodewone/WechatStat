const Database = require('../../plugin/database');
const db = new Database({db: 'hbOtc'});

module.exports = {
    /**
     *
     * @param limit
     * @returns {Promise<*[]>}
     */
    async getData(limit) {
        return db.queryData(limit).catch(() => ([]));
    },
    /**
     *
     * @param limit
     * @returns {Promise<*[]>}
     */
    async getChartData(limit) {
        const {handlerChartData} = require('../mixins');
        const _d = await this.getData(limit);
        return handlerChartData(_d, {x: 'date', y: 'ave', type: 'Otc'});
    }
};
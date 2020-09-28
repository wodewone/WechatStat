const Database = require('plugin/database');
const db = new Database({db: 'hbOtc'});
setTimeout(() => {
    db.getDbInstance().catch(e => {
        process.log.warn('server/otc', e);
    });
}, 2000);

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
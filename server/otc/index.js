module.exports = {
    /**
     *
     * @param limit
     * @returns {Promise<*[]>}
     */
    async getChartData(limit) {
        const Database = require('../../plugin/database');
        const db = new Database({db: 'hbOtc'});
        return db.queryData(limit).catch(() => ([]));
    },
    /**
     *
     * @param limit
     * @returns {Promise<{type: string, content: {mediaId: *|string}}|string>}
     */
    async getImg(limit) {
        const {getChartImg, handlerChartData} = require('../../plugin/utils');
        const _d = await this.getChartData(limit);
        const _l = handlerChartData(_d, {x: 'date', y: 'ave', type: 'Otc'});
        return getChartImg(_l);
    }
};
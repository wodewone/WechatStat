const {handlerChartData} = require('../mixins');

module.exports = fear = {
    async getData(limit = 10) {
        const timeId = process.logTimer();
        const axios = require('axios');
        const {data: {data = []} = {}} = await axios.get(`https://api.alternative.me/fng/?limit=${limit}`).catch(() => ({}));
        process.log.info('Fear Data', process.logTimer(timeId));
        const _d = data || [];
        return _d.map(item => {
            item.date = item.timestamp * 1000;
            return item;
        });
    },
    async getChartData(limit) {
        const _d = await this.getData(limit);
        return handlerChartData(_d, {
            x: 'date',
            y: 'value',
            type: 'Fear and Greed Index',
        });
    },
};
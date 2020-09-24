module.exports = fear = {
    async getChartData(limit = 10) {
        const timeId = process.logTimer();
        const axios = require('axios');
        const {data: {data = []} = {}} = await axios.get(`https://api.alternative.me/fng/?limit=${limit}`).catch(() => ({}));
        process.console.info('Fear Data', process.logTimer(timeId));
        const _d = data || [];
        return _d.map(item => {
            item.date = item.timestamp * 1000;
            return item;
        });
    },
    async getImg(limit) {
        const {getChartImg, handlerChartData} = require('../../plugin/utils');
        const _d = await this.getChartData(limit);
        const _l = handlerChartData(_d, {
            x: 'date',
            y: 'value',
            type: 'Fear and Greed Index',
        });
        return getChartImg(_l);
    },
};
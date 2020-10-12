const getChartMarket = require('server/charts/market');
const {getWxMedia} = require('server/mixins');

module.exports = async (ctx) => {
    process.log.info('route/get/chart/market');

    const {query: {limit = 150, type = 'market'} = {}} = ctx;
    ctx.set('content-type', 'image/png');
    ctx.body = await getChartMarket(limit);
    // ctx.body = await getWxMedia(type, limit);
};
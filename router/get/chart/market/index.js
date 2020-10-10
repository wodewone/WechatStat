const getChartMarket = require('server/charts/market');

module.exports = async (ctx) => {
    process.log.info('route/get/chart/market');

    const {query: {limit = 150} = {}} = ctx;
    const canvas = await getChartMarket(limit);
    ctx.set('content-type', 'image/png');
    ctx.body = canvas.createPNGStream();
};
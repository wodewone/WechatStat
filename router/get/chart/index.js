const {getTypeChartImg} = require('server/mixins');
const f2chart = require('plugin/f2Charts');

module.exports = async (ctx) => {
    process.logTimer('makeImg');
    const {query: {limit, type = 'volume'} = {}} = ctx;

    try {
        ctx.status = 200;
        ctx.set('content-type', 'image/jpeg');
        ctx.body = await getTypeChartImg(type, limit);
        process.log.info('/get/chart', `[${type}]`, process.logTimer('makeImg'));
    } catch (e) {
        ctx.status = 500;
        ctx.body = e;
        process.log.error('/get/chart', e);
    }
};
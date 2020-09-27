const {getTypeChartImg} = require('server/mixins');
const f2chart = require('plugin/f2Charts');

module.exports = async (ctx) => {
    process.logTimer('makeImg');
    const {query: {limit, type = 'vol'} = {}} = ctx;

    try {
        const [list] = await getTypeChartImg(type, limit, true);
        const canvas = await f2chart(list);
        ctx.body = canvas.createPNGStream();
        ctx.set('content-type', 'image/jpeg');
        ctx.status = 200;
        process.console.info('/get/chart', `[${type}]`, process.logTimer('makeImg'));
    } catch (e) {
        ctx.status = 500;
        ctx.body = e;
        process.console.error('/get/chart', e);
    }
};
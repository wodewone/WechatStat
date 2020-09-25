const fs = require('fs');
const mime = require('mime-types');
const {getTypeChartImg} = require('../../server/mixins');

module.exports = async (ctx) => {
    process.console.info('/make/img', '===========================');
    process.logTimer('makeImg');
    const {query: {limit, type = 'vol'} = {}} = ctx;

    const pathname = await getTypeChartImg(type, limit, ctx.body);
    try {
        // ctx.set('content-type', 'image/jpg');
        // const canvas = await getTypeChartImg(type, limit, ctx.body);
        // console.info(116, canvas);
        // canvas.createPNGStream().pipe(ctx.res);

        ctx.set('content-type', mime.lookup(pathname));
        ctx.body = fs.createReadStream(pathname);
        ctx.status = 200;
        // fs.unlink(pathname, e => e);
        process.console.info('/get/chart', `[${type}]`, process.logTimer('makeImg'));
    } catch (e) {
        process.console.error('/get/chart', e);
    }
};
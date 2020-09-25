const fs = require('fs');
const mime = require('mime-types');
const {getTypeChartImg} = require('../../server/mixins');

module.exports = async (ctx) => {
    process.console.info('/make/img', '===========================');
    process.logTimer('makeImg');
    const {query: {limit, type = 'vol'} = {}} = ctx;

    const pathname = await getTypeChartImg(type, limit);
    try {
        ctx.set('content-type', 'image/jpeg');
        // const canvas = await getTypeChartImg(type, limit, ctx.body);
        // console.info(116, canvas);
        // canvas.createPNGStream().pipe(ctx.res);
        ctx.body = fs.createReadStream(pathname);
        // ctx.set('content-type', mime.lookup(pathname));
        // ctx.body = await new Promise(resolve => {
        //     fs.createReadStream(pathname).on('data', (data) => {
        //         console.info(121111, data);
        //         resolve(data);
        //     }).on('end', (data)=>{
        //         console.info(1222222, data);
        //     })
        // });
        ctx.status = 200;
        // fs.unlink(pathname, e => e);
        process.console.info('/get/chart', `[${type}]`, process.logTimer('makeImg'));
    } catch (e) {
        ctx.status = 500;
        ctx.body = e;
        process.console.error('/get/chart', e);
    }
};
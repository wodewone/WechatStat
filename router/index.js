const Router = require('koa-router');
const Database = require('../plugin/database');

const router = new Router({
    prefix: '/v1'
});

router.get('/hb/volume', async ctx => {
    const db_hb = new Database({db: 'hb'});
    const {query: {limit} = {}} = ctx;
    ctx.body = await db_hb.queryData(limit);
});

router.get('/hb/otc', async ctx => {
    const db_hb = new Database({db: 'hbOtc'});
    const {query: {limit} = {}} = ctx;
    ctx.body = await db_hb.queryData(limit);
});

module.exports = router;
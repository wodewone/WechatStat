const Router = require('koa-router');
const Database = require('../plugin/database');

const router = new Router({
    prefix: '/v1'
});

const db_hb = new Database({db: 'hb'});

router.get('/hb/volume', async ctx => {
    const {query: {limit} = {}} = ctx;
    ctx.body = await db_hb.queryData(limit);

});

module.exports = router;
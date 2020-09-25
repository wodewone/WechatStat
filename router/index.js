const Router = require('koa-router');
const Database = require('../plugin/database');
const serve = require('koa-static');

const getChart = require('./get-chart');

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

router.get('/get/chart', getChart);

module.exports = router;
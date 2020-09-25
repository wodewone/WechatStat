const Router = require('koa-router');
const getChart = require('./get-chart');
const {getTypeChartData} = require('../server/mixins');

const router = new Router({
    prefix: '/v1'
});

router.get('/hb/volume', async ctx => {
    const {query: {limit} = {}} = ctx;
    ctx.body = await getTypeChartData('volume', limit);
});

router.get('/hb/otc', async ctx => {
    const {query: {limit} = {}} = ctx;
    ctx.body = await getTypeChartData('otc', limit);
});

router.get('/get/chart', getChart);

module.exports = router;
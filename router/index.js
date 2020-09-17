const Router = require('koa-router');
const {queryData} = require('../plugin/handlerDatabase');

const router = new Router({
    prefix: '/v1'
});

router.get('/hb/volume', async ctx => {
    const {query: {limit = 30} = {}} = ctx;
    ctx.body = await queryData(limit);

});

module.exports = router;
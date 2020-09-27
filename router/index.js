const path = require('path');
const Router = require('koa-router');
const routerConfig = require('./router.config');

const router = new Router({
    prefix: '/v1/'
});

const routeRootPath = __dirname;
const routerList = routerConfig(routeRootPath);

routerList.map(route => {
    const routePath = path.join(routeRootPath, route);
    router.get(route, require(routePath));
});

module.exports = router;
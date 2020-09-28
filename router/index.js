const path = require('path');
const Router = require('koa-router');
const routerConfig = require('./router.config');

const router = new Router({
    prefix: '/v1/'
});

const routeRootPath = __dirname;
const routerList = routerConfig(routeRootPath);

routerList.forEach(({file, route}) => {
    const routePath = path.join(routeRootPath, file);
    const middleware = require(routePath);
    try {
        router.get(route, middleware);
    } catch (e) {
        process.log.warn('router/index', 'middleware not found: ', routePath);
    }
});

module.exports = router;
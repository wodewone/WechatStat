const koa = require('koa');
const moment = require('moment');

process.datetime = () => {
    return moment().format('YYYY-MM-DD HH:mm:ss')
};

const {server: {PORT}} = require('./config');
const {wechat} = require('./server');
const router = require('./router');

const app = new koa();

// wechat serve
app.use(wechat);

// http serve
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT);

console.log(`[${process.datetime()}] Server listen is START [port: ${PORT}]`);
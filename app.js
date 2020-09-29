require('./plugin/prefix');
const koa = require('koa');
const serve = require('koa-static');
const chalk = require('chalk');

const {server: {PORT}, staticServer: {HOME}} = require('./config');
const {getIpv4} = require('./plugin/utils');

const _wechat = require('./server');
const _interface = require('./router');

const app = new koa();

// wechat 微信公众号的路由需要在静态资源服务前面，否则影响微信验证
app.use(_wechat.routes());

// 静态资源服务
app.use(serve(HOME, {extensions: 'index.html'}));

// http serve
app.use(_interface.routes()).use(_interface.allowedMethods());

app.listen(PORT);

const {address: IP} = getIpv4();
const currentURL = chalk.blue.underline.bold(`http://${IP}:${PORT}/`);
process.log.info('ROUTER', `Listen to Interface START; Url: ${currentURL}`);
process.log.info('WECHAT', `Listen to Wechat Service START; [PORT: ${PORT}]`);
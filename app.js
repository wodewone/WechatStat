require('./plugin/prefix');
const koa = require('koa');
const serve = require('koa-static');
const chalk = require('chalk');

const {server: {PORT}, staticServer: {HOME}} = require('./config');
const {getIpv4} = require('./plugin/utils');

const _wechat = require('./server');
const _interface = require('./router');

const app = new koa();

// 静态资源服务
app.use(serve(HOME, {extensions: 'index.html'}));

// wechat serve
app.use(_wechat.routes());

// http serve
app.use(_interface.routes()).use(_interface.allowedMethods());

app.listen(PORT);

const {address: IP} = getIpv4();
const currentURL = chalk.blue.underline.bold(`http://${IP}:${PORT}/`);
process.log.info('ROUTER', `Listen to Interface START; Url: ${currentURL}`);
process.log.info('WECHAT', `Listen to Wechat Service START; [PORT: ${PORT}]`);
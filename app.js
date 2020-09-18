const koa = require('koa');
const moment = require('moment');
const chalk = require('chalk');

const {getIpv4} = require('./plugin/utils');

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

const {address: IP} = getIpv4();
const currentURL = chalk.blue.underline.bold(`http://${IP}:${PORT}/`);
console.log(`[${process.datetime()}] Listen to Interface START; Url: ${currentURL}`);
console.log(`[${process.datetime()}] Listen to Wechat Service START; [PORT: ${PORT}]`);
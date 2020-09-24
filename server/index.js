const Router = require('koa-router');
const wechat = require('co-wechat');

const {responseTimeOut, getChartImg} = require('../plugin/utils');
const {wechatConfig} = require('../config');
const volume = require('./volume');
const fear = require('./fear');
const market = require('./market');
const otc = require('./otc');

// 记录数据
require('./volume/getVolume');

const server_url = `http://'118.24.53.67:8090/wechat`;
const router = new Router();

router.all('wechat', '/wechat', wechat(wechatConfig).middleware(async (msg, ctx, next) => {
    if (msg.MsgType === 'text') {
        const title = msg.Content || '';
        let limit = title.match(/[0-9]+/g) || 10;
        if (title.includes('fear')) {
            process.console.info('fear');
            return await fear.getImg(limit);
        }
        if (title.includes('交易额') || title.includes('vol')) {
            process.console.info('volume');
            // const period = volume.periodArr.includes(title.split(/ +/g)[1]) ? title.split(/ +/g)[1] : 'day';
            const params = title.match(/[0-9]+/g) || [];
            const limit = params[0] || 10;
            // const density = params[1] || 1;
            // const date = title.match(/[0-9]{8}/g) || '';
            return await volume.getImg(limit);
        }
        if (title.includes('行情') || title.includes('mk')) {
            process.console.info('market');
            return await market.getImg(limit);
        }
        if (title.includes('汇率') || title.includes('usdt')) {
            process.console.info('otc');
            return await otc.getImg(limit);
        }
        if (title === '历史记录') {
            process.console.info('历史记录');
            return '还没有消息';
        }
        if (title === '域名') {
            process.console.info('域名');
            return server_url;
        }
    }
    if (msg.MsgType === 'image') {
        process.console.info('image');
        return msg.PicUrl;
    }
    return '';
}));

module.exports = router;
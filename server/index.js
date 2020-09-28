const Router = require('koa-router');
const wechat = require('co-wechat');

const {wechatConfig} = require('config');
const {getWxMedia} = require('./mixins');

const server_url = `http://'118.24.53.67:8090/wechat`;
const router = new Router();

const getChartImg = async (type, limit) => {
    process.log.info(type);
    return await getWxMedia(type, limit).catch(e => 'err: ' + e);
};

router.all('wechat', '/wechat', wechat(wechatConfig).middleware(async (msg, ctx, next) => {
    if (msg.MsgType === 'text') {
        const title = msg.Content || '';
        let limit = title.match(/[0-9]+/g) || 10;

        if (title.includes('fear')) {
            return await getChartImg('fear', limit);
        }
        if (title.includes('交易额') || title.includes('vol')) {
            return await getChartImg('volume', limit);
        }
        if (title.includes('行情') || title.includes('mk')) {
            return await getChartImg('market', limit);
        }
        if (title.includes('汇率') || title.includes('usdt')) {
            return await getChartImg('otc', limit);
        }
        if (title === '历史记录') {
            return '还没有消息';
        }
        if (title === '域名') {
            return server_url;
        }
    }
    if (msg.MsgType === 'image') {
        return msg.PicUrl;
    }
    return '';
}));

module.exports = router;
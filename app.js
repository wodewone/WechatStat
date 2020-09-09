const Koa = require('koa');
const wechat = require('co-wechat');
const moment = require('moment');

const volume = require('./volume');
const fear = require('./fear');
const market = require('./market');
const otc = require('./otc');

const {SERVER_URL, PRO_PORT, WECHAT_CONFIG} = require('./config/config');
const {responseTimeOut} = require('./plugin/utils');

const app = new Koa();

volume.initDataRecord();

const getLog = (type) => {
    console.info(`[${type}]================================[${moment().format('YYYY/MM/DD/ HH:mm:ss')}]`);
};

app.use(wechat(WECHAT_CONFIG).middleware(async (msg, ctx, next) => {
    if (msg.MsgType === 'text') {
        const title = msg.Content || '';
        if (title.includes('fear')) {
            getLog('fear');
            let limit = title.match(/[0-9]+/g) || 1;
            return responseTimeOut({resp: `${SERVER_URL}/wechat/fear.svg`}, fear.getFearChart({limit}));
        }
        if (title.includes('交易额') || title.includes('volume')) {
            getLog('volume');
            const period = volume.periodArr.includes(title.split(/ +/g)[1]) ? title.split(/ +/g)[1] : 'day';
            const params = title.match(/[0-9]+/g) || [];
            const limit = params[0] || 10;
            const density = params[1] || 1;
            const date = title.match(/[0-9]{8}/g) || '';
            return responseTimeOut({resp: `${SERVER_URL}/wechat/volume.svg`}, volume.getChart({period, limit, density, date}));
        }
        if (title.includes('行情') || title.includes('market')) {
            getLog('market');
            return responseTimeOut({resp: `${SERVER_URL}/wechat/market.svg`}, market.getChart({limit: title.match(/[0-9]+/g) || 7}));
        }
        if (title.includes('汇率') || title.includes('usdt')) {
            getLog('otc');
            const period = volume.periodArr.includes(title.split(/ +/g)[1]) ? title.split(/ +/g)[1] : 'day';
            const params = title.match(/[0-9]+/g) || [];
            const limit = params[0] || 10;
            const density = params[1] || 1;
            return responseTimeOut({resp: `${SERVER_URL}/wechat/otc.svg`}, otc.getChart({period, limit, density}));
        }
        if (title === '历史记录') {
            getLog('历史记录');
            return '还没有消息';
        }
        if (title === '域名') {
            getLog('域名');
            return SERVER_URL;
        }
    }
    if (msg.MsgType === 'image') {
        getLog('image');
        return msg.PicUrl;
    }
    return '';
}));

app.listen(PRO_PORT);

console.log(`Server listening at http://127.0.0.1:${PRO_PORT}>>>>>>>>>>${moment().format('YYYY/MM/DD/ hh:mm:ss')}`);
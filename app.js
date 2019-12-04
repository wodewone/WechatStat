const Koa = require('koa');
const wechat = require('co-wechat');

const volume = require('./volume');
const fear = require('./fear');
const market = require('./market');

const {SERVER_URL, PRO_PORT, WECHAT_CONFIG} = require('./config/config');
const {responseTimeOut} = require('./plugin/utils');

const app = new Koa();

// return (async ()=>{
//     console.info(responseTimeOut({resp: `${SERVER_URL}/wechat/fear`}, fear.getFearChart({limit: 1000})))
// })();

/**
 *
 app.use(async (msg, next)=>{
    console.info('ctx', ctx);
    @ msg request content
    {
        ToUserName: 'gh_102524ec3ee8',
        FromUserName: 'ojxUquH7zdEzEpepXZ1N1dzUy-34',
        CreateTime: '1555393610',
        MsgType: 'text',
        Content: 'fear',
        MsgId: '22267881023320195'
    }
 */
app.use(wechat(WECHAT_CONFIG).middleware(async (msg, ctx, next) => {
    console.info('=================================');
    if (msg.MsgType === 'text') {
        const title = msg.Content || '';
        if (title.includes('fear')) {
            let limit = title.match(/[0-9]+/g) || 1;
            return await responseTimeOut({resp: `${SERVER_URL}/wechat/fear.svg`}, fear.getFearChart({limit}));
        }
        if (title.includes('交易额') || title.includes('volume')) {
            const period = volume.periodArr.includes(title.split(/ +/g)[1]) ? title.split(/ +/g)[1] : 'day';
            const params = title.match(/[0-9]+/g) || [];
            const limit = params[0] || 10;
            const density = params[1] || 1;
            const date = title.match(/[0-9]{8}/g) || '';
            return await responseTimeOut({resp: `${SERVER_URL}/wechat/volume.svg`}, volume.getChart({period, limit, density, date}));
        }
        if (title.includes('行情') || title.includes('market')) {
            return await responseTimeOut({resp: `${SERVER_URL}/wechat/market.svg`}, market.getChart({limit: title.match(/[0-9]+/g) || 7}));
        }
        if (title === '历史记录') {
            return '还没有消息';
        }
        if (title === '域名') {
            return SERVER_URL;
        }
    }
    if (msg.MsgType === 'image') {
        return msg.PicUrl;
    }
    return '';
}));


app.listen(PRO_PORT);

console.log(`Server listening at http://127.0.0.1:${PRO_PORT}`);

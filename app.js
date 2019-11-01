const Koa = require('koa');
const wechat = require('co-wechat');
const router = require('koa-router')();

const volume = require('./volume');
const fear = require('./fear');
const market = require('./market');

const port = 8088;
const app = new Koa();

const config = {
    token: 'wodewone',
    appid: 'wx4c2452c3b5b8f406',
    encodingAESKey: 'LLETB4SMUikbSU25uGsVwizb6AGmio4tCVS1BsgUM7D',
    checkSignature: true, // 可选，默认为true。由于微信公众平台接口调试工具在明>文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

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
app.use(wechat(config).middleware(async (msg, ctx, next) => {
    console.info('=================================');
    if (msg.MsgType === 'text') {
        const title = msg.Content || '';
        if (title.includes('fear')) {
            let limit = title.match(/[0-9]+/g);
            return await fear.getFearChart({limit});
        }
        if (title.includes('交易额') || title.includes('volume')) {
            let periodArr = ['day', 'week', 'month'];

            const period = periodArr.includes(title.split(/ +/g)[1]) || 'day';
            const limit = title.match(/[0-9]+/g)[0] || 10;
            const density = title.match(/[0-9]+/g)[1] || 1;
            const date = title.match(/[0-9]+/g)[2] || '';
            return await volume.getChart({period, limit, density, date});
        }
        if (title.includes('行情') || title.includes('market')) {
            return await market.getChart(title.match(/[0-9]+/g) || 7);
        }
        if (title === '历史记录') {
            return '还没有消息';
        }
        if (title === '域名') {
            return 'http://118.24.53.67:8090/'
        }
    }
    if (msg.MsgType === 'image') {
        return msg.PicUrl;
    }
    return '';
}));

// router.get('/', async (ctx, next) => {
//     // console.info(ctx);
//     let {data} = await axios.get('https://api.alternative.me/fng/?limit=10');
//     if(data && data.data){
//         let labels = [];
//         let series = [];
//         data.data.forEach(item => {
//             item.time = moment(item.timestamp * 1000).format('YYYY-MM-DD hh:mm:ss');
//             labels.push(moment(item.timestamp * 1000).format('MM-DD'));
//             series.push(item.value);
//         });
//         const svgPath = await makeCharts(labels, [series]);

//         ctx.response.body = '<h1>Index</h1><br /><input id="file" type="file" />';
//         return true;
//     }
//     ctx.response.body = 'index';
// });
// app.use(router.routes());

app.listen(port);

console.log(`Server listening at http://127.0.0.1:${port}`);

const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const wechat = require('co-wechat');
const axios = require('axios');
const moment = require('moment');
const router = require('koa-router')();

const mChart =require('./makeCharts.js');

const port = 8088;
const app = new Koa();

const config = {
    token: 'wodewone',
    appid: 'wx4c2452c3b5b8f406',
    encodingAESKey: 'LLETB4SMUikbSU25uGsVwizb6AGmio4tCVS1BsgUM7D',
    checkSignature: true // 可选，默认为true。由于微信公众平台接口调试工具在明>文模式下不发送签名，所以如要使用该测试工具，请将其设置为false 
};

const directive = {
    fear: 'BTC 恐慌与贪婪指数',
    history: '历史消息记录'
};

router.get('/', async (ctx, next) => {
    // console.info(ctx);
    let {data} = await axios.get('https://api.alternative.me/fng/?limit=10');
    if(data && data.data){
        let labels = [];
        let series = [];
        data.data.forEach(item => {
            item.time = moment(item.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
            labels.push(moment(item.timestamp * 1000).format('DD'));
            series.push(item.value);
        });
        const svgPath = await mChart(labels.reverse(), [series.reverse()]);

        ctx.response.body = `<h1>Index</h1><br /><input id="file" type="file" /><img src="${svgPath}" alt="" />`;
        return true;
    }
    ctx.response.body = 'index';
});
app.use(router.routes());

app.listen(port);

console.log(`Server listening at http://127.0.0.1:${port}`);

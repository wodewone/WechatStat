const wechat = require('co-wechat');
const moment = require('moment');
const {wechatConfig} = require('../config');

const volume = require('./volume');
const fear = require('./fear');
const market = require('./market');
const otc = require('./otc');

const {responseTimeOut} = require('../plugin/utils');


const server_url = `http://'118.24.53.67:8090/wechat`;
const getLog = (type) => {
    console.info(`[${type}] [${process.datetime()}]`);
};

volume.initDataRecord();

module.exports = {
    wechat: wechat(wechatConfig).middleware(async (msg, ctx, next) => {
        if (msg.MsgType === 'text') {
            const title = msg.Content || '';
            if (title.includes('fear')) {
                getLog('fear');
                let limit = title.match(/[0-9]+/g) || 1;
                return responseTimeOut({resp: `${server_url}/fear.svg`}, fear.getFearChart({limit}));
            }
            if (title.includes('交易额') || title.includes('vol')) {
                getLog('volume');
                const period = volume.periodArr.includes(title.split(/ +/g)[1]) ? title.split(/ +/g)[1] : 'day';
                const params = title.match(/[0-9]+/g) || [];
                const limit = params[0] || 10;
                const density = params[1] || 1;
                const date = title.match(/[0-9]{8}/g) || '';
                return responseTimeOut({resp: `${server_url}/volume.svg`}, volume.getChart({
                    period,
                    limit,
                    density,
                    date
                }));
            }
            if (title.includes('行情') || title.includes('mk')) {
                getLog('market');
                return responseTimeOut({resp: `${server_url}/market.svg`}, market.getChart({limit: title.match(/[0-9]+/g) || 7}));
            }
            if (title.includes('汇率') || title.includes('usdt')) {
                getLog('otc');
                const period = volume.periodArr.includes(title.split(/ +/g)[1]) ? title.split(/ +/g)[1] : 'day';
                const params = title.match(/[0-9]+/g) || [];
                const limit = params[0] || 10;
                const density = params[1] || 1;
                return responseTimeOut({resp: `${server_url}/otc.svg`}, otc.getChart({period, limit, density}));
            }
            if (title === '历史记录') {
                getLog('历史记录');
                return '还没有消息';
            }
            if (title === '域名') {
                getLog('域名');
                return server_url;
            }
        }
        if (msg.MsgType === 'image') {
            getLog('image');
            return msg.PicUrl;
        }
        return '';
    })
};
const fs = require('fs');
const axios = require('axios');
const guard_dog = require('guard_dog');
const {wechatConfig} = require('../../config');

const {appid, secret} = wechatConfig;

if (fs.existsSync('./ACCESS_TOKEN.dog')) {
    fs.unlinkSync('./ACCESS_TOKEN.dog');
}
// init access_token
// 因为微信限制access_token每两小时更新一次，所以本地做缓存避免每次请求服务器
guard_dog.init('ACCESS_TOKEN', async (handler) => {
    let {data: {access_token, expires_in}} = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`);
    handler(access_token, expires_in);
});

module.exports = new Promise((resolve, reject) => {
    guard_dog.get('ACCESS_TOKEN', token => {
        return resolve(token);
    })
});
const axios = require('axios');
const guard_dog = require('guard_dog');

const appid = 'wx4c2452c3b5b8f406';
const secret = 'ea0bf9fd347de3c2ce04e65b19641926';

// 加载这个模块的时候给 ACCESS_TOKEN 这个键名初始化
guard_dog.init('ACCESS_TOKEN', async (handler) => {
    let {data: {access_token, expires_in}} = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`);
    console.info('=======> init <=======', 'ACCESS_TOKEN');
    handler(access_token, expires_in);
});

module.exports = () => {
    return new Promise((resolve, reject) => {
        guard_dog.get('ACCESS_TOKEN', token => {
            return resolve(token);
        })
    })
};
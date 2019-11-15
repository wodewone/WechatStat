const fs = require('fs');
const axios = require('axios');
const guard_dog = require('guard_dog');

const appid = 'wx4c2452c3b5b8f406';
const secret = 'ea0bf9fd347de3c2ce04e65b19641926';

if(fs.existsSync('./ACCESS_TOKEN.dog')){
    fs.unlinkSync('./ACCESS_TOKEN.dog');
}
// 初始化字段值
guard_dog.init('ACCESS_TOKEN', async (handler) => {
    let {data: {access_token, expires_in}} = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`);
    console.info('=======> ACCESS_TOKEN <=======', access_token);
    handler(access_token, expires_in);
});

module.exports = async () => {
    return new Promise((resolve, reject) => {
        guard_dog.get('ACCESS_TOKEN', token => {
            return resolve(token);
        })
    })
};
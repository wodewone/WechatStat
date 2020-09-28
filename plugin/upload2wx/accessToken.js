const fs = require('fs');
const path = require('path');
const axios = require('axios');
const guard_dog = require('guard_dog');
const {wechatConfig: {appid, secret}} = require('config');

const dogName = 'ACCESS_TOKEN';
const dogPath = path.join(__dirname, dogName + '.dog');
if (fs.existsSync(dogPath)) {
    fs.unlinkSync(dogPath);
}

const accessToken = {
    getWxToken() {
        return new Promise((resolve, reject) => {
            try {
                guard_dog.get(dogName, token => {
                    if (token) {
                        return resolve(token);
                    } else {
                        throw '';
                    }
                })
            } catch (e) {
                accessToken.getAccessToken().then(({access_token}) => {
                    resolve(access_token);
                });
            }
        })
    },
    /**
     * 因为微信限制 access_token 隔一段时间才更新一次，所以本地做缓存避免每次请求服务器
     * @returns {Promise<{access_token, expires_in}>}
     */
    async getAccessToken() {
        let {data: {access_token, expires_in} = {}} = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`).catch(() => ({}));
        try {
            guard_dog.init('ACCESS_TOKEN', (handler) => {
                handler(access_token, expires_in);
            }, __dirname);
        } catch (e) {
            process.log.error('getAccessToken', e);
        }
        return {access_token, expires_in};
    }
};

module.exports = accessToken;
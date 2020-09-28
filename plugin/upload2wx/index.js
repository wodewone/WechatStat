const fs = require('fs');
const rp = require('request-promise');
const {getWxToken} = require('./accessToken');

// 上传png图到微信临时空间，获得media_id
module.exports = async (imgPathName) => {
    try {
        const logTimeId = process.logTimer();
        const form = {
            smfile: fs.createReadStream(imgPathName),
        };
        let token = await getWxToken();
        let opt = {
            // uri: `https://sm.ms/api/upload`,   // 上传到图床
            uri: `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=image`,   // 上传到微信临时素材
            method: 'POST',
            formData: form,
            headers: {
                'User-Agent': 'Request-Promise',
            },
            json: true,
        };
        let {media_id} = await rp(opt);
        process.log.info('plugin/upload2wx', process.logTimer(logTimeId));
        return media_id;
    } catch (e) {
        process.log.warn('plugin/upload2wx', 'Warn: Marke image faild: ', e);
    }
};
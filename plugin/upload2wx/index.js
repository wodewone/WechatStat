const fs = require('fs');
const fetch = require('request-promise');
const {getWxToken} = require('./accessToken');

// 上传png图到微信临时空间，获得media_id
// axios
// {
//     errcode: 41005,
//     errmsg: 'media data missing hint: [dYFmga04150021] rid: 5f83f4d7-0533f43c-01030ec0',
// }
module.exports = async (filepath) => {
    const token = await getWxToken();
    const media = fs.createReadStream(filepath);
    const {media_id} = await fetch.post({
        url: `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=image`,
        json: true,
        formData: {media}
    }).catch(e => process.log.warn('plugin/upload2wx', e));
    // const data = await axios.post(`https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=image`, {media}).catch(e => process.log.warn('plugin/upload2wx', e));
    return media_id;
};
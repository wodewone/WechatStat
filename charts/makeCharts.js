const fs = require('fs');
const svg2png = require('svg2png');
const chartistSvg = require('svg-chartist');
const rp = require('request-promise');

const accessToken = require('./accessToken.js');

const nginxPath = '/home/www/wechat/';

// function makeImage(svgString){
//   return new Promise((resolve, reject)=> {
//     svg2img(svgString, {format: 'jpg','quality': 75}, (error, buffer) => {
//       if(buffer){
//         fs.writeFileSync(filePath + 'chart.jpg', buffer);
//         return resolve();
//       }
//       return reject();
//     });
//   });
// }

/**
 * API 文档
 * https://itbilu.com/nodejs/npm/BkCASacpm.html
 * @param labels    Y轴 坐标系
 * @param series    X轴 数据需为二维数组，可同时展示多组数据
 * @param title     图表标题
 * @param subtitle  图表副标题
 * @param [fileName]  生成图片文件名[可选]
 * @returns {Promise<boolean>}
 */
module.exports = async ({local, labels, series, title = '', subtitle = ''}, fileName = 'chart') => {
    const chartData = {
        title,
        subtitle,
        labels,
        series,
    };

    const opts = {
        options: {
            fullWidth: true,
            chartPadding: 50,
        },
        title: {
            height: 50,
            fill: "#4A5572"
        },
        subtitle: {
            fill: "#999"
        },
    };

    const filePath = './chartsImg/';
    const svgPathName = filePath + fileName + '.svg';
    const pngPathName = filePath + fileName + '.png';
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }

    // 生成svg
    let svgString = await chartistSvg('line', chartData, opts);
    svgString = svgString.replace('class="ct-chart-line">', '><rect width="100%" height="100%" style="fill:rgb(255,255,255)"/>');
    fs.writeFileSync(svgPathName, svgString);
    // fs.writeFileSync(filePath + 'chart.html', svgString);

    // 备份到到 Nginx 路径下
    // 可以通过域名访问
    if (fs.existsSync(nginxPath)) {
        fs.writeFileSync(nginxPath + fileName + '.svg', svgString);
    }
    
    // svg 转 png
    const buffer = await svg2png(fs.readFileSync(svgPathName));
    fs.writeFileSync(pngPathName, buffer);
    // await makeImage(svgString);

    if(local){
        return 'success !';
    }
    // 上传png图到微信临时空间，获得media_id
    try {
        const form = {
            smfile: fs.createReadStream(filePath + 'temp.png'),
        };
        let token = await accessToken();
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
        let {media_id, created_at} = await rp(opt);
        return media_id;
    } catch (e) {
        console.warn('Marke image faild: ', e);
        return false;
    }
};
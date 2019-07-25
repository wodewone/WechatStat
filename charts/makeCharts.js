const fs = require('fs');
const svg2png = require('svg2png');
const chartistSvg = require('svg-chartist');
const rp = require('request-promise');

const accessToken = require('./accessToken.js');

const filePath = '/home/www/wechat/';

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

module.exports = async (labels, series, name) => {
    const chartData = {
        labels,
        series,
    };

    const opts = {
        options: {
            fullWidth: true,
            chartPadding: 30,
        },
    };

    const pngPath = './chartsImg/';
    if (!fs.existsSync(pngPath)) {
        fs.mkdirSync(pngPath);
    }
    const fileName = name || `chart.svg`;

    // 生成svg
    let svgString = await chartistSvg('line', chartData, opts);
    svgString = svgString.replace('class="ct-chart-line">', '><rect width="100%" height="100%" style="fill:rgb(255,255,255)"/>');
    fs.writeFileSync(pngPath + fileName, svgString);
    fs.writeFileSync(filePath + 'chart.svg', svgString);
    // fs.writeFileSync(pngPath + 'chart.html', svgString);

    // svg 转 png
    const buffer = await svg2png(fs.readFileSync(pngPath + 'chart.svg'));
    fs.writeFileSync(pngPath + 'temp.png', buffer);
    // await makeImage(svgString);

    // 上传png图到微信临时空间，获得微信图像素材id
    try {
        const form = {
            smfile: fs.createReadStream(pngPath + fileName),
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
    // let {code, data} = await rp(opt);

    // if(code === 'success'){
    //   let {url} = data;
    //   return url;
    // }

    // return fileName;
};
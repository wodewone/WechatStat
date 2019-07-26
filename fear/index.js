const path = require('path');
const axios = require('axios');
const moment = require('moment');

const makeCharts = require('../charts/makeCharts.js');


function handlerDateFormat(time, index, total) {
    if (total <= 15) {
        return moment(time).format('YYYY-MM-DD');
    }
    if (total <= 30) {
        return moment(time).format('MM-DD');
    }
    if (!(index % 3)) {
        return moment(time).format('YY-MM-DD');
    }
    return '';
}

module.exports = fear = async (limit) => {
    let {data: {data}} = await axios.get(`https://api.alternative.me/fng/?limit=${limit}`);
    let singleValue = 'heihei……';
    if (data) {
        let labels = [];
        let series = [];
        data.forEach((item, index) => {
            singleValue = item.value + '';
            labels.unshift(handlerDateFormat(item.timestamp * 1000, index, data.length));
            // labels.unshift(day * 1 === 1 ? `•${moment(item.timestamp * 1000).format('D')}` : day);
            series.unshift(item.value);
        });
        if (limit > 1) {
            // return [
            //     {
            //       title: 'Crypto Fear & Greed Index',
            //       description: directive.fear,
            //       picurl,
            //       url: 'http://118.24.53.67:8090/wechat/chart.html'
            //     }
            //   ];
            let mediaId = await makeCharts({
                labels,
                series: [series],
                title: 'Crypto Fear & Greed Index'
            }, {filePath: __dirname, fileName: 'fear'});
            console.info('Make fear media ID:', mediaId);
            if (mediaId) {
                return {
                    type: "image",
                    content: {
                        mediaId,
                    },
                };
            } else {
                return 'http://118.24.53.67:8090/wechat/chart.svg';
            }
        } else {
            return `Crypto Fear & Greed Index: ${singleValue}`;
        }
    }
};

// fear(50);
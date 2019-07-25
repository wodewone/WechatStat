const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment');

const makeCharts = require('../charts/makeCharts.js');

module.exports = fear = async (limit) => {
    let {data: {data}} = await axios.get(`https://api.alternative.me/fng/?limit=${limit}`);
    let singleValue = 'heihei……';
    if (data) {
        let labels = [];
        let series = [];
        data.forEach(item => {
            let day = moment(item.timestamp * 1000).format('D');
            singleValue = item.value + '';
            item.time = moment(item.timestamp * 1000).format('YYYY-MM-DD hh:mm:ss');
            labels.unshift(day * 1 === 1 ? `•${moment(item.timestamp * 1000).format('D')}` : day);
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
            let mediaId = await makeCharts({labels, series: [series]});
            console.info('make media ID:', mediaId);
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
}

// fear(5);
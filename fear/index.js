const axios = require('axios');
const moment = require('moment');

const makeCharts = require('../charts/makeCharts.js');

module.exports = fear = {
    handlerDateFormat(time, index, total) {
        total = total - 1;
        if (total < 15) {
            return moment(time).format('MM-DD HH:mm');
        } else {
            if (total < 30) {
                if ((index % 2 || (total - index) < 2) && total !== index) {
                    return '';
                }
            } else {
                if (total < 30) {
                    if ((index % 3 || (total - index) <= 2) && total !== index) {
                        return '';
                    }
                } else {
                    if ((index % 5 || (total - index) <= 2) && total !== index) {
                        return '';
                    }
                }
            }
        }
        return moment(time).format('MM-DD');
    },
    /**
     * @param limit 数据量；0 = 全部
     * @returns {Promise<*>}
     */
    async getFearData(limit = 1) {
        let {data: {data}} = await axios.get(`https://api.alternative.me/fng/?limit=${limit}`);
        let labels = [];
        let series = [];
        if (data.length) {
            data.reverse().forEach((item, index) => {
                labels.push(this.handlerDateFormat(item.timestamp * 1000, index, data.length));
                series.push(item.value);
            });
        }
        console.info(871, labels);
        return {labels, series};
    },
    async getFearChart({limit}) {
        const {labels, series} = await this.getFearData(limit);
        if (series && series.length) {
            if (series.length === 1) {
                return `Crypto Fear & Greed Index: ${series[0] || 'heihei……'}`;
            } else {
                let mediaId = await makeCharts({
                    labels,
                    series: [series],
                    title: 'Crypto Fear & Greed Index'
                }, {filePath: __dirname, fileName: 'fear'});
                // console.info('Make fear media ID:', mediaId);
                if (mediaId) {
                    return {
                        type: "image",
                        content: {mediaId},
                    };
                } else {
                    return 'http://118.24.53.67:8090/wechat/chart.svg';
                }
            }
        }
    }
};

//     fear.getFearChart({limit: 120});
//     await fear.getFearData(32);
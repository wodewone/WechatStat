const axios = require('axios');
const moment = require('moment');

const makeCharts = require('../charts/makeCharts.js');

module.exports = fear = {
    handlerDateFormat(time, index, total) {
        if (total <= 15) {
            return moment(time).format('MM-DD');
        }
        if (total < 30 && !(index % 3)) {
            return moment(time).format('MM-DD');
        }
        if (total < 50 && !(index % 5)) {
            return moment(time).format('MM-DD');
        }
        if (total < 90 && !(index % 10)) {
            return moment(time).format('MM-DD');
        }
        //if (total <= 15) {
        //    return moment(time).format('YYYY-MM-DD');
        //}
        //if (total <= 30) {
        //    return moment(time).format('MM-DD');
        //}
        //if (!(index % 3)) {
        //    return moment(time).format('YY-MM-DD');
        //}
        return '';
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

// fear(50);
const volume = require("../volume");
const makeCharts = require('../charts/makeCharts.js');

module.exports = otc = {
    async getChart({period, limit, density, local}) {
        const {labels, series} = await volume.getChartData({
            type: 'otc',
            full: false,
            period, limit, density,
        });
        let mediaId = await makeCharts({
            local,
            labels,
            series: [series],
            title: 'Huobi OTC USDT MARKET',
            subtitle: 'USDT 日均价',
        }, {fileName: 'otc'});
        if (mediaId) {
            return {
                type: "image",
                content: {mediaId},
            };
        }
        return '…………';
    }
};

// otc.getChart({limit: 100, local: 1, period: 'min'});
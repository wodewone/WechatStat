const moment = require('moment');
const volume = require("../volume");
const fear = require("../fear");
const makeCharts = require('../charts/makeCharts.js');

module.exports = market = {
    async getChart({limit = 7, local}) {
        const {series: $vol} = await volume.getChartDataV2({limit});
        const maxLen = $vol.length;
        const {labelDate, labels, series: $fear} = await fear.getFearData(maxLen);
        // const {series: _vol} = await volume.getChartData({
        //     limit,
        //     offset: moment().diff(moment(labelDate[labelDate.length - 1]), 'd')
        // });

        let mediaId = await makeCharts({
            local,
            labels,
            series: [[], $vol, $fear],
            title: 'Fear.Greed & Exchange volume',
            subtitle: `orange = fear.greed. red = volume. ${maxLen < limit ? 'volume max length ' + maxLen : ''} `,
        }, {fileName: 'market'});

        local && console.warn('[Warn] Market chart success!');

        if (mediaId) {
            return {
                type: "image",
                content: {mediaId},
            };
        }
        return '…………';
    }
};

// market.getChart({limit: 100, local: 1});
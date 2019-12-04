const moment = require('moment');
const volume = require("../volume");
const fear = require("../fear");
const makeCharts = require('../charts/makeCharts.js');

module.exports = market = {
    async getChart({limit = 7, local}) {
        const {labelDate, labels, series: _fear} = await fear.getFearData(limit);
        const {series: _vol} = await volume.getChartData({
            limit,
            offset: moment().diff(moment(labelDate[labelDate.length - 1]), 'd')
        });
        let mediaId = await makeCharts({
            local,
            labels,
            series: [[], _vol, _fear],
            title: 'Fear.Greed & Exchange volume',
            subtitle: 'orange = fear.greed. red = volume.',
        }, {fileName: 'market'});
        if (mediaId) {
            return {
                type: "image",
                content: {mediaId},
            };
        }
        return '…………';
    }
};

market.getChart({limit: 30, local: 1});
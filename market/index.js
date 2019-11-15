const moment = require('moment');
const volume = require("../volume");
const fear = require("../fear");
const makeCharts = require('../charts/makeCharts.js');

module.exports = market = {
    async getChart({limit = 7, local}) {
        const {labels, series: _fear} = await fear.getFearData(limit);
        const {series: _vol} = await volume.getChartData({
            limit,
            offset: moment().format('MMDD') - moment(labels[labels.length - 1]).format('MMDD')
        });
        let mediaId = await makeCharts({
            local,
            labels,
            series: [[], _vol, _fear],
            title: 'Fear.Greed & Exchange volume',
            subtitle: 'orange = fear.greed. red = volume.',
        }, {filePath: __dirname, fileName: 'fear'});
        if (mediaId) {
            return {
                type: "image",
                content: {mediaId},
            };
        }
        return '…………';
    }
};

// (async () => {
//     console.info(222, await market.getChart({limit: 120, local: 1}));
// })();
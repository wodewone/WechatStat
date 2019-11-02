const volume = require("../volume");
const fear = require("../fear");
const makeCharts = require('../charts/makeCharts.js');

module.exports = market = {
    async getChart(limit = 7){
        const {series: _vol} = await volume.getChartData({limit});
        const {series: _fear} = await fear.getFearData(limit);
        let mediaId = await makeCharts({
            labels: [],
            series: [[], _vol, _fear],
            title: 'Fear.Greed & Exchange volume'
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

//(async () => {
//    console.info(await market.getChart(7));
//})();
const fs = require('fs');
const Canvas = require('canvas');
const numeral = require('numeral');

const F2 = require('@antv/f2/lib/core');
// require('@antv/f2/lib/geom/schema');
require('@antv/f2/lib/geom/line');
require('@antv/f2/lib/geom/interval');
require('@antv/f2/lib/geom/point');

const Legend = require('@antv/f2/lib/plugin/legend');       // Legend 插件
F2.Chart.plugins.register(Legend);

const volume = require('server/volume');
const fear = require('server/fear');

module.exports = getChartMarket = async (limit, filename) => {
    const [_vol, _fear] = await Promise.all([
        volume.getChartData(limit),
        fear.getChartData(limit)
    ]);
    const data = _vol.map((item, index) => {
        return {
            ...item,
            fear: _fear[index].data
        }
    });

    const pixelRatio = 2;
    const width = 400 * pixelRatio + Math.min(data.length * 0.8, 500);
    const height = 267 * pixelRatio;
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    const chart = new F2.Chart({
        context,
        width,
        height,
        // pixelRatio
    });

    chart.source(data, {
        data: {
            tickCount: 7,
            formatter: function formatter(value) {
                return numeral(value).format('0.00 a');
            }
        },
        fear: {
            ticks: [0, 15, 30, 45, 60, 75, 90],
        },
        date: {
            type: 'timeCat',
            range: [0, 1],
        },
    });

    chart.axis('fear', {
        grid: null
    });

    chart.legend({
        custom: true,
        itemWidth: null,
        items: [
            {name: 'data', fill: '#4b9cfa'},
            {name: 'fear', fill: '#facc14'},
        ]
    });

    // chart.schema().position('date*range').color('trend', function (trend) {return ['#F4333C', '#1CA93D'][trend];}).shape('candle');
    chart.interval().position('date*data').color('#4b9cfa');
    chart.line().position('date*fear').color('#facc14');
    chart.point().position('date*fear').size(2).color('#fab31e');

    chart.render();
    if (filename) {
        const {chartImgPath} = require('server/mixins');
        const pathname = chartImgPath + filename;
        const outStream = fs.createWriteStream(pathname);
        canvas.createPNGStream().pipe(outStream);
        return new Promise((resolve) => {
            outStream.on('finish', () => {
                resolve({
                    filename,
                    pathname
                })
            })
        });
    }
    return canvas.createPNGStream();
};
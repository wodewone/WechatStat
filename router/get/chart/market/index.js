const F2 = require('@antv/f2/lib/core');
const Canvas = require('canvas');
const numeral = require('numeral');

const mkChart = (data) => {
    const pixelRatio = 2;
    const width = 400 * pixelRatio + Math.min(data.length * 0.5, 300);
    const height = 267 * pixelRatio;
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    const chart = new F2.Chart({
        context,
        width,
        height,
        pixelRatio
    });

    chart.source(data, {
        range: {
            tickCount: 5,
            formatter: function formatter(value) {
                return numeral(value).format('0.00 a');
            }
        },
        date: {
            tickCount: 3
        }
    });
    chart.schema()
        .position('date*range')
        .color('trend', function (trend) {
            return ['#F4333C', '#1CA93D'][trend];
        })
        .shape('candle');
    chart.render();
    return canvas;
};

const {getData} = require('server/volume');
module.export = async (ctx) => {
    process.log.info('route/get/chart/market');
    const {query: {limit} = {}} = ctx;
    const _data = await getData(limit);
    _data.forEach(item => {
        const {open, close, high, low} = item;
        item.range = [open, close, high, low];
        item.trend = open <= close ? 0 : 1;
    }, []);
    const canvas = mkChart(_data);
    ctx.body = canvas.createPNGStream();
};
const fs = require('fs');
const path = require('path');
const Canvas = require('canvas');
const moment = require('moment');
const numeral = require('numeral');
const F2 = require('@antv/f2/lib/core');

require('@antv/f2/lib/geom/line');                          // 加载折线图
require('@antv/f2/lib/component/guide');                    // 加载 guide 组件
const Guide = require('@antv/f2/lib/plugin/guide');        // Guide 插件
const Legend = require('@antv/f2/lib/plugin/legend');      // Legend 插件
F2.Chart.plugins.register([Legend, Guide]);        // 注册以上插件

const drawChart = ({data, width, height}) => {
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    const chart = new F2.Chart({
        context,
        width,
        height,
    });
    chart.source(data, {
        date: {
            type: 'timeCat',
            range: [0, 1],
            tickCount: 3,
        },
        data: {
            type: 'linear',
            alias: '日均值',
            formatter(value, index) {
                return numeral(value).format('0.00 a');
            },
        }
    });
    chart.legend();
    chart.axis('date', {
        label(text, index, total) {
            const textCfg = {};
            if (index === 0) {
                textCfg.textAlign = 'left';
            } else if (index === total - 1) {
                textCfg.textAlign = 'right';
            }
            return textCfg;
        }
    });
    chart.line().position('date*ave').color('type');
    // chart.point().position('date*ave').style({
    //     stroke: '#fff',
    //     lineWidth: 1
    // });
    chart.render();
    return canvas;
};

module.exports = (data = [{date: 20010101, data: 1234.5678, type: null}]) => {
    const width = 400;
    const height = 267;
    const bgCanvas = Canvas.createCanvas(width, height);
    const bgContext = bgCanvas.getContext('2d');
    const chartCanvas = drawChart({data, width, height});

    bgContext.fillStyle = '#fff';
    bgContext.fillRect(0, 0, width, height);
    bgContext.drawImage(chartCanvas, 0, 0);

    const chartName = `chart-${moment().format('YYYYMMDD-HHmmss')}.jpg`;
    const filePth = path.join(__dirname, 'chartsImg/');
    const pathName = path.join(filePth, chartName);
    bgCanvas.createPNGStream().pipe(fs.createWriteStream(pathName));

    return {
        chartName,
        pathName
    };
};
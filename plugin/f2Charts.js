const fs = require('fs');
const Canvas = require('canvas');
const numeral = require('numeral');
const F2 = require('@antv/f2/lib/core');

require('@antv/f2/lib/geom/line');                          // 加载折线图
require('@antv/f2/lib/component/guide');                    // 加载 guide 组件
require('@antv/f2/lib/geom/point');

const Guide = require('@antv/f2/lib/plugin/guide');         // Guide 插件
const Legend = require('@antv/f2/lib/plugin/legend');       // Legend 插件
F2.Chart.plugins.register([Legend, Guide]);                // 注册以上插件
F2.Global.setTheme({fontFamily: 'PingFang SC'});

const drawChart = ({data, width, height, pixelRatio}) => {
    const canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    const chart = new F2.Chart({
        context,
        width,
        height,
        pixelRatio
    });
    chart.source(data, {
        date: {
            type: 'timeCat',
            range: [0, 1],
        },
        data: {
            type: 'linear',
            formatter(value) {
                return numeral(value).format('0.00 a');
            },
        }
    });
    chart.legend({
        align: 'left',
    });
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
    chart.line().position('date*data').color('type');
    // chart.point().position('date*data').size(2);
    chart.render();
    return canvas;
};

/**
 *
 * @param data      [{date: 20010101,data: 1234.5678, type: null}, ...]
 * @param filename
 * @returns {{pathName: string, chartName: string}|*}
 */
module.exports = async (data = [], filename = '') => {
    const pixelRatio = 2;
    const width = 400 * pixelRatio + Math.min(data.length * 0.5, 300);
    const height = 267 * pixelRatio;
    let canvas = Canvas.createCanvas(width, height);
    const context = canvas.getContext('2d');
    const chartCanvas = drawChart({data, width, height});

    const fileType = filename.split('.')[1];
    const transparent = fileType === 'png';
    if (transparent) {
        canvas = chartCanvas;
    } else {
        context.fillStyle = '#fff';
        context.fillRect(0, 0, width, height);
        context.drawImage(chartCanvas, 0, 0);
    }

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
    } else {
        return canvas.createPNGStream();
    }
};
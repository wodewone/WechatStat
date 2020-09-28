const fs = require('fs');
const path = require('path');
const f2chart = require('plugin/f2Charts');

// 预连接数据库
require('server/volume');
require('server/otc');

const mixins = {
    /**
     *
     * @param data
     * @param filename
     * @returns {Promise<string|{type: string, content: {mediaId: *}}>}
     */
    async getChartImgPath(data = [], filename) {
        const timeId = process.logTimer();
        const {pathname} = await f2chart(data, filename);
        process.log.info('chart img path', process.logTimer(timeId));
        return pathname;
    },

    /**
     *
     * @param list
     * @param x
     * @param y
     * @param type
     * @param formatter
     * @returns {[]}
     */
    handlerChartData(list = [], {x = 'date', y = 'data', type = '--', formatter} = {}) {
        if (!list || !list.length) {
            process.log.error('handler chart data', 'Params [list] must be Array type: ', JSON.stringify(list));
            return [];
        }
        formatter = typeof formatter === 'function' ? formatter : null;
        return list.map(item => {
            const o = {};
            o.date = (formatter ? formatter(x, item) : item[x]) || item[x] || '';
            o.data = ((formatter ? formatter(y, item) : item[y]) || item[y]) * 1 || '';
            o.type = type;
            return o;
        });
    },

    chartImgName({prefix = 'chart', type = 'temp', limit = '0', date = process.datetime('YYYYMMDD'), suffix = 'jpg'}) {
        return `${prefix}-${type}-${limit}-${date}.${suffix}`;
    },

    chartImgPath: (() => {
        const filePth = path.join(__dirname, '../chartsImg/');
        if (!fs.existsSync(filePth)) {
            fs.mkdirSync(filePth);
        }
        return filePth;
    })(),

    checkChartImgCache(filename) {
        const pathname = mixins.chartImgPath;
        const filePath = path.join(pathname, filename);
        return fs.existsSync(filePath) ? filePath : false;
    },

    async getTypeChartData(type = 'volume', limit = 10) {
        try {
            const dataRes = require(`./${type}`);
            if (dataRes && dataRes.getChartData) {
                return dataRes.getChartData(limit);
            }
        } catch (e) {
            return [];
        }
    },

    async getTypeChartImg(type, limit) {
        const _l = await mixins.getTypeChartData(type, limit);
        const filename = mixins.chartImgName({date: +new Date()});
        return [_l, filename];
    },

    async getTypeChartImgCache(type, limit) {
        const filename = mixins.chartImgName({type, limit});
        const filePath = mixins.checkChartImgCache(filename);
        if (filePath) {
            return filePath;
        }
        const _l = await mixins.getTypeChartData(type, limit);
        return mixins.getChartImgPath(_l, filename);
    },


    async getWxMedia(type, limit) {
        const pathname = await mixins.getTypeChartImgCache(type, limit);
        const upload2wx = require('plugin/upload2wx');
        const mediaId = await upload2wx(pathname).catch(e => {
            process.log.warn('getWxMedia', e);
        });
        if (mediaId) {
            return {
                type: "image",
                content: {
                    mediaId,
                },
            };
        } else {
            return 'Sorry,Make image failed!';
        }
    },
};

module.exports = mixins;
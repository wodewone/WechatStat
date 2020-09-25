const fs = require('fs');
const path = require('path');
const mixins = {
    /**
     *
     * @param data
     * @param filename
     * @param stream
     * @returns {Promise<string|{type: string, content: {mediaId: *}}>}
     */
    async getChartImgPath(data = [], filename, stream) {
        const timeId = process.logTimer();
        const f2chart = require('../plugin/f2Charts');
        const {pathname} = await f2chart(data, filename, stream);

        process.console.info('chart img path', process.logTimer(timeId));
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
            process.console.error('handler chart data', 'Params [list] must be Array type: ', JSON.stringify(list));
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

    chartImgPath() {
        const filePth = path.join(__dirname, '../chartsImg/');
        if (!fs.existsSync(filePth)) {
            fs.mkdirSync(filePth);
        }
        return filePth;
    },

    checkChartImgCache(filename) {
        const pathname = mixins.chartImgPath();
        const filePath = path.join(pathname, filename);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
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

    async getTypeChartImg(type, limit, stream) {
        const _l = await mixins.getTypeChartData(type, limit);
        const filename = mixins.chartImgName({date: +new Date()});
        return mixins.getChartImgPath(_l, filename, stream);
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
        const timeId = process.logTimer();
        const upload2wx = require('../plugin/upload2wx');
        const pathname = await mixins.getTypeChartImgCache(type, limit);
        if (process.env.production) {
            const mediaId = await upload2wx(pathname);
            process.console.info('upload 2 wx', process.logTimer(timeId));
            if (mediaId) {
                return {
                    type: "image",
                    content: {
                        mediaId,
                    },
                };
            } else {
                return '[Warn] Marke image faild!';
            }
        } else {
            process.console.info('get Wx media', process.logTimer(timeId));
            return pathname;
        }
    },
};

module.exports = mixins;
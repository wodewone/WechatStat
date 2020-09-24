module.exports = {
    responseTimeOut({time = 4900, resp = ''}, ...event) {
        return Promise.race([
            new Promise((resolve) => {
                setTimeout(resolve, time, resp);
            }),
            ...event,
        ])
    },
    getIpv4() {
        const os = require('os');
        const networks = os.networkInterfaces();
        return [].concat(...Object.values(networks)).find(({family, address, internal}) => family === 'IPv4' && address !== '127.0.0.1' && !internal) || {};
    },
    async getChartImg(data = []) {
        const timeId = process.logTimer();
        const f2chart = require('./f2Charts');
        const upload2wx = require('./upload2wx');

        const {pathName} = await f2chart(data);
        if (!process.env.DEV) {
            const mediaId = await upload2wx(pathName);
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
            process.console.info('get chart img', pathName, ' ', process.logTimer(timeId));
            return pathName;
        }
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
            throw 'Params [list] must be Array type';
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
};


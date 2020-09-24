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
        const f2chart = require('./f2Charts');
        const upload2wx = require('./upload2wx');

        const {pathName} = f2chart(data);
        if (!process.env.DEV) {
            const mediaId = await upload2wx(pathName);
            return {
                type: "image",
                content: {
                    mediaId,
                },
            };
        } else {
            process.console.info('getChartImg', pathName);
            return pathName;
        }
    },
    handlerChartData(list = [], {x = 'date', y = 'data', type = ''} = {}) {
        if (!list || !list.length) {
            throw 'Params [list] must be Array type';
        }
        return list.map(item => {
            const o = {};
            o[x] = item[x];
            o[y] = item[y];
            o[type] = item[type];
            return o;
        });
    },
};


module.exports = {
    responseTimeOut({time = 4800, resp = ''}, ...event) {
        return Promise.race([
            new Promise((resolve) => {
                setTimeout(resolve, time, resp);
            }),
            ...event,
        ])
    },
    getNetworkInfo() {

    },
    getIpv4() {
        const os = require('os');
        const networks = os.networkInterfaces();
        return [].concat(...Object.values(networks)).find(({family, address, internal}) => family === 'IPv4' && address !== '127.0.0.1' && !internal) || {};
    },
};


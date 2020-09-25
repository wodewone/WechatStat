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

    parseQuery(query) {
        const decode = decodeURIComponent;
        let res = {};
        query = query.trim().replace(/^([?#&])/, '');
        if (!query) {
            return res
        }
        query.split('&').forEach(function (param) {
            const parts = param.replace(/\+/g, ' ').split('=');
            const key = decode(parts.shift());
            const val = parts.length > 0 ? decode(parts.join('=')) : null;
            if (res[key] === undefined) {
                res[key] = val;
            } else if (Array.isArray(res[key])) {
                res[key].push(val);
            } else {
                res[key] = [res[key], val];
            }
        });
        return res;
    },
};
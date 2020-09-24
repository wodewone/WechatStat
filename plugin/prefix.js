const moment = require('moment');
try {
    if (process) {
        process.datetime = (format = 'YYYY-MM-DD HH:mm:ss') => {
            return moment().format(format)
        };

        const timerObj = {};
        /**
         * 计算运行时间
         * 第一次调用开始记录，第二次获取
         * @param timeId        传入ID开始记录【可选 | (String|Number) | 默认为时间戳，为避免重复推荐使用时间戳】
         * @param complete      是否销毁ID记录【可选 | Boolean | 默认true用完销毁；false 记录多次时间差，统计总时间】
         * @returns {string|number}
         */
        process.logTimer = (timeId = +new Date(), complete = true) => {
            const now = +new Date();
            if (timerObj[timeId]) {
                const begin = timerObj[timeId];
                if (complete) {
                    delete timerObj[timeId];
                }
                return `${timeId} | ` + (now - begin) / 1000 + 'sec';
            } else {
                timerObj[timeId] = now;
                return timeId;
            }
        };

        process.console = {
            info(type, ...str) {
                console.info(`[${process.datetime()}] [INFO] [${type}]`, ...str);
            },
            warn(type, ...str) {
                console.warn(`[${process.datetime()}] [WARN] [${type}]`, ...str);
            },
            error(type, ...str) {
                console.error(`[${process.datetime()}] [ERROR] [${type}] ${str}`, ...str);
            },
        };
    }
} catch (e) {
}
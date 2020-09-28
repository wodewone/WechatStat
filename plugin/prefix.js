const moment = require('moment');
const {parseQuery} = require('plugin/utils');
try {
    if (process) {
        process.datetime = (format = 'YYYY-MM-DD HH:mm:ss') => {
            return moment().format(format)
        };

        /**
         * 计算运行时间
         * 第一次调用开始记录，第二次获取
         * @param timeId        传入ID开始记录【可选 | (String|Number) | 默认为时间戳，为避免重复推荐使用时间戳】
         * @param complete      是否销毁ID记录【可选 | Boolean | 默认true用完销毁；false 记录多次时间差，统计总时间】
         * @returns {string|number}
         */
        const timerObj = {};
        process.logTimer = (timeId = +new Date(), complete = true) => {
            const now = +new Date();
            if (timerObj[timeId]) {
                const begin = timerObj[timeId];
                if (complete) {
                    delete timerObj[timeId];
                }
                return `耗时：${(now - begin) / 1000} sec`;
            } else {
                timerObj[timeId] = now;
                return timeId;
            }
        };

        process.log = {
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

        // 加载环境信息
        if (process.env.NODE_ENV) {
            process.log.info('NODE_ENV', process.env.NODE_ENV);
            if (process.env.NODE_ENV === 'production')
                process.env.production = 1;
        }

        // 加载 pm2 args参数
        if (process.env.args) {
            const pm2args = parseQuery(process.env.args);
            process.env = {...process.env, ...pm2args};
            for (const key in pm2args) {
                if (!process.env[key]) {
                    process.env[key] = pm2args[key];
                } else {
                    console.error('prefix', `process.env 中已存在key为${key}的值，请检查并重新配置！`);
                }
            }
        }
    }
} catch (e) {
    console.error('Error in prefix file! ', e);
}
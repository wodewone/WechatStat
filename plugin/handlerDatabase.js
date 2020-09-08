const Decimal = require('decimal.js');
const moment = require('moment');
const db = require('./mongodb');

// TODO:【mongodb docs】API https://docs.mongodb.com/v4.2/reference/method/js-collection/
// TODO:【mongodb-node docs】API http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html
// TODO:【decimal.js docs】API http://mikemcl.github.io/decimal.js/
// TODO:【mongodb 中文 docs】API https://www.docs4dev.com/docs/zh/mongodb/v3.6/reference/reference-method-db.collection.find.html

const utils = {
    amendDateTime(date = '2001-01-01') {
        return new Date(`${date} 00:00:00`);
    },
    getNextDateTime(datetime = new Date()) {
        return moment(datetime).add(1, 'days');
    },
    time2date(datetime = new Date()) {
        return moment(datetime).format('YYYY-MM-DD');
    },
    getAveraging(array = []) {
        const total = array.reduce((so, {data}) => {
            return Decimal.add(so, data);
        }, 0);
        const ave = Decimal.div(total, array.length);
        return ave * 1 ? ave * 1 : 0;
    },
};

module.exports = database = {
    dbName: 'huobi',

    setDbName(key = String) {
        const dbList = {
            test: 'test',
            hb: 'huobi',
            hbOtc: 'huobi_otc',
        };
        if (dbList[key]) {
            database.dbName = dbList[key];
        } else {
            throw `Not fund DB name of ${key}`;
        }
    },

    async getCollection(collectName, force = false) {
        const {dbName, getCollection} = database;
        try {
            const client = await db.instance(dbName, force).catch(e => console.info('[Info] Get collection instance error:', e));
            return client.db(dbName).collection(collectName);
        } catch (e) {
            if (!force) {
                return getCollection(collectName, true);
            }
            console.warn(`[Warn] Collection get Error!`);
        }
    },

    getCollectName(key, date) {
        const collectionName = {
            key: {
                prefix: 'key_',
                dateFormat: 'YYYYMM'
            },
            set: {
                prefix: 'kline_',
                dateFormat: 'YYYY'
            }
        };
        const item = collectionName[key];
        if (!item) {
            return key;
        }
        if (!moment(date).isValid()) {
            return null;
        }
        const {prefix, dateFormat} = item;
        return prefix + moment(date).format(dateFormat);
    },

    async getDayKline(dateline) {
        const {findData, getCollectName} = database;
        const collectName = getCollectName('key', dateline);

        const {amendDateTime, getNextDateTime, time2date} = utils;
        const q1 = +amendDateTime(time2date(dateline));
        const q2 = +amendDateTime(time2date(getNextDateTime(dateline)));

        return findData(collectName, {time: {$gt: q1, $lt: q2}}, {projection: {"data": 1, "_id": 0}});
    },

    async handlerMarketList(datalist = []) {
        if (!datalist.length) {
            return false;
        }

        const {data: open = 0} = datalist[0] || {};
        const {data: close = 0} = datalist[datalist.length - 1] || {};

        return datalist.reduce((so, {data = 0}) => {
            const {high, low} = so;
            so.high = Math.max(high, data);
            so.low = Math.min(low, data);
            return so;
        }, {open, close, high: 0, low: Infinity});
    },

    async handlerMarketValue(value = 0, {collectName, dateline}) {
        const {findData} = database;
        const {time2date} = utils;
        const date = time2date(dateline);
        const [dateKline] = await findData(collectName, {date}, {
            projection: {
                "date": 0,
                "_id": 0
            }
        });

        if (dateKline) {
            const {close, low, high} = dateKline;
            return {
                ...dateKline,
                close: value || close,
                low: Math.min(low, value) || low,
                high: Math.max(high, value) || high
            };
        } else {
            return {
                high: value,
                low: Infinity,
                open: value,
                close: value,
            };
        }
    },

    async getMarketsValue(doc = {} || [], {collectName, dateline}) {
        const {getAveraging} = utils;
        const {getDayKline, handlerMarketValue, handlerMarketList} = database;

        const {time, data: defaultValue = 0} = (Array.isArray(doc) ? doc[0] : doc) || {};

        const dayKline = Array.isArray(doc) ? doc : await getDayKline(dateline);

        const ave = getAveraging(dayKline) || defaultValue;

        const market = Array.isArray(doc) ? await handlerMarketList(doc) : await handlerMarketValue(defaultValue, {
            collectName,
            dateline
        });

        return {...market, ave};
    },

    async updateDayKline(doc, dateline = new Date(), dbName) {
        const {getMarketsValue, updateData, getCollectName, setDbName} = database;
        const {time2date} = utils;

        try {
            dbName && setDbName(dbName);
        } catch (e) {
            console.error(`[Warn] Execute update day kline error: ${e}`);
            return null;
        }

        const collectName = getCollectName('set', dateline);
        if (!collectName) {
            return {
                error: '找不到对应数据'
            }
        }

        const setData = await getMarketsValue(doc, {collectName, dateline});
        const date = time2date(dateline);
        await updateData({date}, setData, {dbName, collectName});
    },

    /**
     *
     * @param collectName
     * @param query
     * @param options
     * @returns {Promise<Promise|number[]|void|any[]>}
     */
    async findData(collectName, query, options) {
        const collection = await database.getCollection(collectName);
        return collection.find(query, options).toArray();
    },

    /**
     *
     * @param document  [Object...] | Object (Object = {time: 0, data: 0})
     * @param date      date | datetime | timestamp
     * @param dbName
     * @returns {Promise<void>}
     */
    async insertData(document, date = new Date(), dbName) {
        if (!document) {
            return null;
        }
        const {getCollection, getCollectName, setDbName} = database;

        try {
            dbName && setDbName(dbName);
        } catch (e) {
            console.error(`[Warn] Execute insert data error: ${e}`);
            return null;
        }

        const tableName = getCollectName('key', date);
        const collection = await getCollection(tableName);
        try {
            if (Array.isArray(document)) {
                console.info('[Info] Ready insert data to: ', tableName, ' And data list: ', document.length);
                return collection.insertMany(document);
            } else {
                console.info('[Info] Ready insert data to: ', tableName, ' And data: ', document);
                return collection.insertOne(document);
            }
        } catch (e) {
            console.error('[Warn] insert data error: ', e);
            return null;
        }
    },

    async updateData(query, data, db = {}) {
        const {collectName} = db;
        if (!query || !data || !collectName) {
            return false
        }
        const collection = await database.getCollection(collectName);
        try {
            await collection.updateOne(query, {$set: data}, {upsert: true});
        } catch (e) {
            console.warn('[Warn] Execute update data: ', e);
        }
    },

    async queryData(range = 7, type = 'volume') {
        const {findData, getCollectName, setDbName} = database;
        const collectName = getCollectName('key', dateline);

        const dbName = {
            volume: 'hb',
            otc: 'hbOtc',
        };
        setDbName(dbName[type]);

        const {amendDateTime, getNextDateTime, time2date} = utils;
        const q1 = +amendDateTime(time2date(dateline));
        const q2 = +amendDateTime(time2date(getNextDateTime(dateline)));

        return findData(collectName, {time: {$gt: q1, $lt: q2}}, {projection: {"data": 1, "_id": 0}});
    },
};

// insertData({"time":1569859213126,"data":8183505176.23391});
// const ss = ['20200425', '20200426', '20200427', '20200428', '20200429', '20200430', '20200501', '20200502', '20200503', '20200504', '20200505', '20200506', '20200507'];
// ss.map(i => {
//     updateDayKline({}, i).then(r => {});
// });

/* DEMO */
// {
//     key_201907: [
//         {"time":1564588858477,"data":5587929951.3230505},
//         {"time":1564588858477,"data":5587929951.3230505},
//         {"time":1564588858477,"data":5587929951.3230505},
//     ],
//     key_201908: [
//         {"time":1564588858477,"data":5587929951.3230505},
//         {"time":1564588858477,"data":5587929951.3230505},
//         {"time":1564588858477,"data":5587929951.3230505},
//     ],
//     kline_[2019]: [
//         {
//             "date": "2019-08-07",
//             "ave": 5587929951.3230505,
//             "high": 5587929951.3230505,
//             "low": 5587929951.3230505,
//             "open": 5587929951.3230505,
//             "close": 5587929951.3230505,
//         },
//     ],
// }

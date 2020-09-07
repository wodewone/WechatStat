const Decimal = require('decimal.js');
const moment = require('moment');
const db = require('./mongodb');

// TODO:【mongodb】API http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html
// TODO:【decimal.js】API http://mikemcl.github.io/decimal.js/
// TODO:【cloud】URL https://cloud.mongodb.com/

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

    async getCollection(collectName) {
        const {dbName} = this;
        const client = await db.instance(dbName).catch(e => console.warn('[Info] get collection instance error:', e));
        return client.db(dbName).collection(collectName);
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
        const {findData, getCollectName} = this;
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

    async handlerMarketValue(value = 0, {collectName, dateline: date}) {
        const {findData} = this;
        const [dateKline] = await findData(collectName, {date}, {
            projection: {
                "date": 0,
                "_id": 0
            }
        });
        console.log(6512, dateKline);
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
        const {getDayKline, handlerMarketValue, handlerMarketList} = this;

        const {time, data: defaultValue = 0} = (Array.isArray(doc) ? doc[0] : doc) || {};

        const dayKline = Array.isArray(doc) ? doc : await getDayKline(dateline);

        const ave = getAveraging(dayKline) || defaultValue;

        const market = Array.isArray(doc) ? await handlerMarketList(doc) : await handlerMarketValue(defaultValue, {
            collectName,
            dateline
        });

        return {...market, ave};
    },

    async updateDayKline(doc, dateline, dbName) {
        const {getMarketsValue, updateData, getCollectName, setDbName} = this;
        const {time2date} = utils;

        dbName && setDbName(dbName);

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
        const collection = await this.getCollection(collectName);
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
        const {getCollection, getCollectName, setDbName} = this;

        dbName && setDbName(dbName);

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
            console.warn('[Warn] insert data: ', e);
            return 'InsertData error';
        }
    },

    async updateData(query, data, db = {}) {
        const {collectName} = db;
        if (!query || !data || !collectName) {
            return false
        }
        const collection = await this.getCollection(collectName);
        try {
            await collection.updateOne(query, {$set: data}, {upsert: true});
        } catch (e) {
            console.warn('[Warn] update data: ', e);
        }
    },

    setDbName(name) {
        this.dbName = name;
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

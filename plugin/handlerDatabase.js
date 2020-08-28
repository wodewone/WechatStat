const Decimal = require('decimal.js');
const moment = require('moment');
const db = require('./mongodb');

// TODO:【mongodb】API http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html
// TODO:【decimal.js】API http://mikemcl.github.io/decimal.js/

const getCollection = async ({dbName = 'huobi', collectName = 'kline'} = {}) => {
    const client = await db.instance(dbName);
    let collection = null;
    collection = await client.db(dbName).collection(collectName);
    return collection;
};

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

const database = {
    checkDateName(name) {
    },

    async getDayKline(dateline) {
        const collectName = `key_${moment(dateline).format('YYYYMM')}`;

        const {amendDateTime, getNextDateTime, time2date} = utils;
        const q1 = +amendDateTime(time2date(dateline));
        const q2 = +amendDateTime(time2date(getNextDateTime(dateline)));

        const {findData} = database;
        return findData(collectName, {time: {$gt: q1, $lt: q2}}, {projection: {"data": 1, "_id": 0}});
    },

    async handlerMarketList(datalist = []) {
        if (!datalist.length) {
            return false;
        }

        const {data: open = 0} = datalist[0] = {};
        const {data: close = 0} = datalist[datalist.length - 1] = {};

        return datalist.reduce((so, {data = 0}) => {
            const {high, low} = so;
            so.high = Math.max(high, data);
            so.low = Math.min(low, data);
            return so;
        }, {open, close, high: 0, low: Infinity});
    },

    async handlerMarketValue(value = 0, {collectName, date}) {
        const {findData} = database;
        const [dateKline] = await findData(collectName, {date}, {
            projection: {
                "low": 1,
                "high": 1,
                "_id": 0
            }
        });
        console.info(1411, collectName, date, dateKline);
        if (dateKline) {
            const {low, high} = dateKline;
            return {
                close: value,
                low: Math.min(low, value),
                high: Math.max(high, value)
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

    async updateDayKline(doc, dateline) {
        const collectName = `kline_${moment(dateline).format('YYYY')}`;
        const {getMarketsValue, updateData} = database;
        const {time2date} = utils;

        const setData = await getMarketsValue(doc, {collectName, dateline});

        const date = time2date(dateline);
        await updateData(collectName, {date}, setData);
    },

    // async createDayKline({date = null, ave = 0, high = 0, low = 0, open = 0, close = 0} = {}) {
    //     if (!date) {
    //         return false;
    //     }
    //     const collectName = `kline${moment().format('YYYY')}`;
    //     const collection = await getCollection({collectName});
    //     return await collection.insertOne({date, ave, high, low, open, close});
    // },

    /**
     *
     * @param collectName
     * @param query
     * @param options
     * @returns {Promise<Promise|number[]|void|any[]>}
     */
    async findData(collectName, query, options) {
        const collection = await getCollection({collectName});
        return collection.find(query, options).toArray();
    },

    /**
     *
     * @param document  [Object...] | Object (Object = {time: 0, data: 0})
     * @param date      date | datetime | timestamp
     * @returns {Promise<void>}
     */
    async insertData(document, date = new Date()) {
        if (!document) {
            return null;
        }
        const tableName = `key_${moment(date).format('YYYYMM')}`;
        const collection = await getCollection({collectName: tableName});
        try {
            if (Array.isArray(document)) {
                console.info('[Info] Ready insert data to: ', tableName, ' And data list: ', document.length);
                await collection.insertMany(document);
            } else {
                console.info('[Info] Ready insert data to: ', tableName, ' And data: ', document);
                await collection.insertOne(document);
            }
        } catch (e) {
            console.warn('[Warn] insertData: ', e);
        }
    },

    async updateData(collectName, query, data) {
        const collection = await getCollection({collectName});
        console.info(8871, query, data);
        try {
            await collection.updateOne(query, {$set: data}, {upsert: true});
        } catch (e) {
            console.warn('[Warn] updateData: ', e);
        }
    },
};

const {insertData, updateDayKline} = database;
module.exports = {insertData, updateDayKline};

// insertData({"time":1569859213126,"data":8183505176.23391});

updateDayKline([{"time": 1569859213126, "data": 123.12345}, {"time": 1569859213126, "data": 456.456}, {"time": 1569859213126, "data": 789.789}, {"time": 1569859213126, "data": 4321.4321}, {"time": 1569859213126, "data": 10.456}], '2019-08-27').then(r => {});

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
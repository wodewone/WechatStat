const Decimal = require('decimal.js');
const moment = require('moment');
const db = require('./mongodb');

// TODO: API http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#find

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
    async getTodayKline(collection) {
        const {amendDateTime, getNextDateTime, time2date} = utils;
        const q1 = +amendDateTime(time2date(new Date()));
        const q2 = +amendDateTime(time2date(getNextDateTime()));
        const data = await collection.find({time: {$gt: q1, $lt: q2}}, {projection: {"data": 1, "_id": 0}}).toArray();
        return data;
    },

    async handlerUpdateData(array = []) {
        const _d = {
            high: 0,
            low: 0,
            open: 0,
            close: 0,
        };
        if (typeof array !== "object" || !array.length) {
            return _d;
        }
        const {data: open = 0} = array[0] || {};
        const {data: close = 0} = array[array.length - 1] || {};
        let info = {..._d, open, close};

        const val = array.reduce((so, {data = 0}) => {
            const {high, low} = so;
            so.high = Decimal.max(high, data);
            so.low = Decimal.min(low, data);
        }, info);
        console.info('get u d: ', array, val);
        return val;
    },

    async updateDayKline(value) {
        const collectName = `k${moment().format('YYYYMM')}`;
        const {getTodayKline, createDayKline, handlerUpdateData, updateData} = database;
        const collection = await getCollection({collectName});
        const todayKline = await getTodayKline(collection);

        const {time2date, getAveraging} = utils;
        const date = time2date();
        // const today = await collection.find({date}).toArray();
        if (todayKline.length) {
            const ave = getAveraging(todayKline);
            // const klineList = await collection.find({date}).toArray();
            await updateData(collectName, {date}, {...await handlerUpdateData(todayKline), ave});
        } else {
            if (!await createDayKline({date})) {
                console.warn('##### createDayKline error! #####');
            }
        }
        // console.info('find date: ', todayKline);
    },

    async createDayKline({date = null, ave = 0, high = 0, low = 0, open = 0, close = 0} = {}) {
        if (!date) {
            return false;
        }
        const collectName = `kline${moment().format('YYYY')}`;
        const collection = await getCollection({collectName});
        return await collection.insertOne({date, ave, high, low, open, close});
    },

    async insertData(obj = {time: 0, data: 0}) {
        const tableName = `k${moment().format('YYYYMM')}`;
        const collection = await getCollection({collectName: tableName});
        console.info('Ready insert data to: ', tableName, ' And data: ', obj);
        await collection.insertOne(obj);
        await database.updateDayKline(obj.data);
    },
    async updateData(collectName, query, data) {
        const collection = await getCollection({collectName});
        await collection.updateOne(query, {$set: data});
    },
};

const {insertData} = database;

module.exports = {insertData};

// me.insertData({"time":1569859213126,"data":8183505176.23391});

// {
//     201907: [
//         {"time":1564588858477,"data":5587929951.3230505},
//         {"time":1564588858477,"data":5587929951.3230505},
//         {"time":1564588858477,"data":5587929951.3230505},
//     ],
//     201908: [
//         {"time":1564588858477,"data":5587929951.3230505},
//         {"time":1564588858477,"data":5587929951.3230505},
//         {"time":1564588858477,"data":5587929951.3230505},
//     ],
//     kline[2019]: [
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
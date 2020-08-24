const Decimal = require('decimal.js');
const moment = require('moment');
const db = require('./mongodb');

const getCollection = async ({dbName = 'huobi', collectName = 'kline'} = {}) => {
    const client = await db.instance(dbName);
    let collection = null;
    collection = await client.db(dbName).collection(collectName);
    console.info(1921);
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
        return Decimal.div(total, array.length);
    },
};

// module.exports = {
const me = {
    async getDayAverage(collection) {
        const {amendDateTime, getNextDateTime, time2date, getAveraging} = utils;
        const q1 = +amendDateTime(time2date(new Date(1564588858477)));
        const q2 = +amendDateTime(time2date(getNextDateTime()));
        const data = await collection.find({time: {$gt: q1, $lt: q2}}, {projection: {"data": 1, "_id": 0}}).toArray();
        const ave = getAveraging(data);
        console.info('updateDayKline: ', q1, q2);
        return ave;
    },
    async updateDayKline(value) {
        const tableName = `kline${moment().format('YYYY')}`;
        const collection = await getCollection({collectName: tableName});

        let ave = null;
        try {
            ave = this.getDayAverage(collection);
        } catch (e) {
            console.warn('getDayAverage: ', e);
        }
        const {time2date} = utils;
        const date = time2date();
        const dayKline = await collection.find({date}).toArray();
        if (dayKline.length) {

        } else {
            if (!await this.createDayKline(collection, {date: '2020-08-06', ave, open})) {
                console.warn('##### createDayKline error! #####');
            }
        }
        console.info('find date: ', dayKline);
    },
    async createDayKline(collection, {date = null, ave = 0, high = 0, low = 0, open = 0, close = 0} = {}) {
        if (!date) {
            return false;
        }
        return await collection.insertOne({date, ave, high, low, open, close})
    },
    async add(obj = {time: 0, data: 0}) {
        const tableName = `k${moment().format('YYYYMM')}`;
        const collection = await getCollection({collectName: tableName});
        // await collection.insertOne(obj);
        this.updateDayKline(obj.data);
    },
};

me.add({"time":1569859213126,"data":8183505176.23391});

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

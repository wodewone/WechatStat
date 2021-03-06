const Decimal = require('decimal.js');
const moment = require('moment');

const db = require('./mongodb');

//【mongodb docs】API https://docs.mongodb.com/v4.2/reference/method/js-collection/
//【mongodb-node docs】API http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html
//【decimal.js docs】API http://mikemcl.github.io/decimal.js/
//【mongodb 中文 docs】API https://www.docs4dev.com/docs/zh/mongodb/v3.6/reference/reference-method-db.collection.find.html

module.exports = class Database {
    dbName;
    dbInstance;

    constructor({db = 'hb'} = {}) {
        this.dbName = Database.getDb(db);
    }

    static getDb(key = String) {
        const dbList = {
            test: 'test',
            hb: 'huobi',
            hbOtc: 'huobi_otc',
        };
        if (dbList[key]) {
            return dbList[key];
        }
        return key;
    }

    static utils = {
        amendDateTime(date = '2001-01-01') {
            return new Date(`${date} 00:00:00`);
        },
        getNextDateTime(datetime = +new Date()) {
            return moment(datetime).add(1, 'days');
        },
        time2date(datetime = +new Date(), format = 'YYYY-MM-DD') {
            return moment(datetime).format(format);
        },
        getAveraging(array = []) {
            const total = array.reduce((so, {data}) => {
                return Decimal.add(so, data);
            }, 0);
            const ave = Decimal.div(total, array.length);
            return ave * 1 ? ave * 1 : 0;
        },
        date2number(datetime = +new Date(), format = 'YYYYMMDD') {
            return moment(datetime).format(format) * 1;
        }
    };

    static getCollectName(key, _date) {

        const {time2date} = Database.utils;
        const collectionName = {
            "key": {
                prefix: 'key_',
                dateFormat: 'YYYYMM'
            },
            "set": {
                prefix: 'kline',
                dateFormat: ''
            }
        };
        const option = collectionName[key];
        if (!option) {
            return key;
        }
        const {prefix, dateFormat} = option;
        if (dateFormat) {
            return prefix + time2date(_date, dateFormat);
        } else {
            return prefix;
        }
    }

    static async getDayKline(collection, _date) {
        const {amendDateTime, getNextDateTime, time2date} = Database.utils;

        const q1 = +amendDateTime(time2date(_date));
        const q2 = +amendDateTime(time2date(getNextDateTime(_date)));

        return collection.find({time: {$gt: q1, $lt: q2}}, {projection: {"data": 1, "_id": 0}}).toArray();
    }

    static async handlerMarketList(datalist = []) {
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
    }

    static async handlerMarketValue(collection, value = 0, dateline) {
        const {date2number} = Database.utils;
        const date = date2number(dateline);
        const [dateKline] = await collection.find({date}, {
            projection: {
                "_id": 0,
                "open": 1,
                "close": 1,
                "high": 1,
                "low": 1,
            }
        }).toArray();

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
    }

    /**
     * 获取数据库连接实例
     * @returns {Promise<Database>}
     */
    async getDbInstance() {
        if (!this.dbInstance) {
            this.dbInstance = await db.instance(this.dbName).catch(e => process.log.info('Get Collection', 'Get collection instance error:', e));
        }
        return this;
    }

    /**
     * 计算行情数据
     * @param doc
     * @param _date
     * @returns {Promise<{[p: string]: *}>}
     */
    async getMarketsValue(doc = {} || [], _date) {
        const {getDayKline, handlerMarketValue, handlerMarketList, getCollectName, utils} = Database;
        const {getAveraging} = utils;

        const {data: defaultValue = 0} = (Array.isArray(doc) ? doc[0] : doc) || {};
        const getKline = async () => {
            if (Array.isArray(doc)) {
                return doc;
            } else {
                const collection = await this.getCollection(getCollectName('key', _date));
                return getDayKline(collection, _date);
            }
        };
        const dayKline = await getKline();
        const ave = getAveraging(dayKline) || defaultValue;
        const market = Array.isArray(doc) ? await handlerMarketList(doc) : await handlerMarketValue(await this.getCollection(getCollectName('set')), defaultValue, _date);

        return {...market, ave};
    }

    /**
     * 更新指定集合数据
     * @param query
     * @param data
     * @param collectName
     * @returns {Promise<boolean>}
     */
    async updateData(query, data, collectName) {
        if (!query || !data || !collectName) {
            return false
        }
        const collection = await this.getCollection(collectName);
        try {
            return collection.updateOne(query, {"$set": data}, {"upsert": true});
        } catch (e) {
            process.log.warn('Update Data', 'Execute update data: ', e);
        }
    }

    /**
     * 查询 Collection
     * @param collectName
     * @param force
     * @returns {Promise<*|undefined>}
     */
    async getCollection(collectName, force = false) {
        const {dbName, dbInstance} = this;
        try {
            if (!dbInstance) {
                await this.getDbInstance();
            }
            return dbInstance.collection(collectName);
        } catch (e) {
            process.log.warn('Get Collection', `[db: ${dbName}] `, e);
        }
    }

    /**
     * 更新指定日期的数据
     * @param document
     * @param dateline
     * @returns {Promise<boolean|undefined>}
     */
    async updateDayKline(document, dateline = +new Date()) {
        const {getCollectName, utils} = Database;
        const {date2number} = utils;

        const setData = await this.getMarketsValue(document, dateline);

        const collectName = getCollectName('set');
        const date = date2number(dateline);

        if (process.env.production) {
            return this.updateData({date}, setData, collectName);
        } else {
            process.log.info('Update Day Kline', `[db: ${this.dbName}] [collectName: ${collectName}] :`, date);
        }
    }

    /**
     * 插入数据（可以是数组或对象；默认当前时间）
     * @param document      [Object...] | Object (Object = {time: 0, data: 0})
     * @param date          date | datetime | timestamp
     * @returns {Promise<void>}
     */
    async insertData(document, date = +new Date()) {
        if (!document) {
            throw `[Warn] insert data error for document type is ${Object.prototype.toString.call(document)}`;
        }
        try {
            const collectName = Database.getCollectName('key', date);
            const collection = await this.getCollection(collectName);

            if (process.env.production) {
                if (Array.isArray(document)) {
                    return collection.insertMany(document);
                } else {
                    return collection.insertOne(document);
                }
            } else {
                process.log.info('Insert Data', `[db: ${this.dbName}] [collect: ${collectName}]: `, date);
            }
        } catch (e) {
            process.log.error('Insert Data', 'insert data error: ', e);
            return null;
        }
        return this;
    }

    /**
     * 查询指定长度的数据
     * @param range
     * @returns {Promise<*[]|*>}
     */
    async queryData(range = 7) {
        const timeId = process.logTimer();
        if (!range || +range <= 0) {
            return [];
        }
        const {getCollectName, utils: {date2number, time2date}} = Database;
        const today = moment().dayOfYear();
        const startDate = date2number(moment().dayOfYear(today - range));
        const collectName = getCollectName('set');
        const collection = await this.getCollection(collectName);
        const list = await collection.find({date: {$gt: startDate}}, {projection: {"_id": 0}}).toArray();

        process.log.info('query data', `[db: ${this.dbName}]`, process.logTimer(timeId));
        return list.map(item => {
            let {date} = item;
            date = time2date(date + '');
            return {...item, date};
        });
    }

    /**
     * 插入及更新数据
     * @param doc
     * @returns {Promise<void>}
     */
    async addDoc2Cloud(doc) {
        await this.insertData(doc).catch(e => process.log.error('addDoc2Cloud', e));
        await this.updateDayKline(doc).catch(e => process.log.error('addDoc2Cloud', e));
    }
};

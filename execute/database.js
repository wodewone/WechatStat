const moment = require('moment');
require('plugin/prefix');

const Database = require('plugin/database');

/* ===============================[TEST]=============================== */

/* drop collection */
const dropCollect = async () => {
    function* iteratorFun() {
        for (let i = 0; i < 87; i++) {
            yield i;
        }
    }

    let iterator = iteratorFun();
    let iteratorItem = iterator.next();

    db.instance('huobi').then(async client => {
        const db = client.db('huobi');
        // return console.info(988, db);
        while (!iteratorItem.done) {
            const {value} = iteratorItem;
            const collectName = 'kline' + moment('20190724').add(value, 'days').format();
            const coll = await db.collection(collectName);
            coll.drop();
            console.info(988, value);
            iteratorItem = iterator.next();
        }
    });
};

/* Insert other Data */
const insertData = async () => {
    insertData({"time": 1569859213126, "data": 8183505176.23391});
    const ss = ['20200425', '20200426', '20200427', '20200428', '20200429', '20200430', '20200501', '20200502', '20200503', '20200504', '20200505', '20200506', '20200507'];
    ss.map(i => {
        database.updateDayKline({}, i).then(r => {
        });
    });
};

/* other */
const other = async () => {
    const {getCollectName, findData, getDayKline, updateData} = Database;

    const collectName = getCollectName('kline_2020');
    const dataList = await findData(collectName, {}, {projection: {"_id": 0}});
    const filesList = dataList && dataList.length ? dataList.splice(-2) : [];

    function* iteratorFun() {
        const len = filesList.length;
        for (let i = 0; i < len; i++) {
            const item = filesList[i];
            for (let j = 0; j < item.length; j++) {
                yield item[j];
            }
        }
    }

    let iterator = iteratorFun();
    let iteratorItem = iterator.next();
    let errList = [];

    const isOtc = 0;

    while (!iteratorItem.done) {
        const {value} = iteratorItem;
        const {date} = value;

        try {
            const list = await getDayKline(date);
            await updateData({date}, {list}, collectName);
        } catch (e) {
            console.log(9911, e);
            errList.push(value);
        }
        iteratorItem = iterator.next();
    }

    console.info(`Execute Success and err list: `, errList);
};


/* 数据修复 */
const fixData = async function () {
    const isOtc = true;

    const db = new Database({db: isOtc ? 'hbOtc' : 'hb'});
    const {getAveraging} = Database.utils;
    const collectName = Database.getCollectName('set');
    const collection = await db.getCollection(collectName);
    const all = await collection.find({date: {$gt: 20200919}}, {"_id": 0}).toArray();
    // const all = await collection.find({"date": 20200920}, {"_id": 0}).toArray();
    const list = all.filter(({low, close, open, high, ave}) => [low, close, open, high, ave].filter(v => isOtc ? v > 10 : v < 10).length);

    // console.info('get ', list);
    console.info('====================================');

    for (const {date} of list) {
        const dateStr = date + '';
        const collectKey = Database.getCollectName('key', dateStr);
        const collection = await db.getCollection(collectKey);
        const dayData = await Database.getDayKline(collection, dateStr);
        const markets = await Database.handlerMarketList(dayData);
        const ave = getAveraging(dayData);
        const doc = {...markets, ave};

        await db.updateData({date}, doc, collectName);
        console.info('[Excute] ', date, doc);
    }
};

const drawChart = async () => {
    const f2Chart = require('plugin/f2Charts');
    const db = new Database();
    const data = await db.queryData(300);

    const res = f2Chart(data);
    console.info(981, res);
};

// drawChart();
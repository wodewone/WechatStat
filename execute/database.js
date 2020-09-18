/* ===============================[TEST]=============================== */

/* drop collection */
// (async function f() {
//     function* iteratorFun() {
//         for (let i = 0; i < 87; i++) {
//             yield i;
//         }
//     }
//
//     let iterator = iteratorFun();
//     let iteratorItem = iterator.next();
//
//     db.instance('huobi').then(async client => {
//         const db = client.db('huobi');
//         // return console.info(988, db);
//         while (!iteratorItem.done) {
//             const {value} = iteratorItem;
//             const collectName = 'kline' + moment('20190724').add(value, 'days').format();
//             const coll = await db.collection(collectName);
//             coll.drop();
//             console.info(988, value);
//             iteratorItem = iterator.next();
//         }
//     });
// })()

// insertData({"time":1569859213126,"data":8183505176.23391});
// const ss = ['20200425', '20200426', '20200427', '20200428', '20200429', '20200430', '20200501', '20200502', '20200503', '20200504', '20200505', '20200506', '20200507'];
// ss.map(i => {
//     database.updateDayKline({}, i).then(r => {});
// });

// (async function () {
//     const {getCollectName, findData, getDayKline, updateData} = database;
//
//     const collectName = getCollectName('kline_2020');
//     const dataList = await findData(collectName, {}, {projection: {"_id": 0}});
//     const filesList = dataList && dataList.length ? dataList.splice(-2) : [];
//
//     function* iteratorFun() {
//         const len = filesList.length;
//         for (let i = 0; i < len; i++) {
//             const item = filesList[i];
//             for (let j = 0; j < item.length; j++) {
//                 yield item[j];
//             }
//         }
//     }
//
//     let iterator = iteratorFun();
//     let iteratorItem = iterator.next();
//     let errList = [];
//
//     const isOtc = 0;
//
//     while (!iteratorItem.done) {
//         const {value} = iteratorItem;
//         const {date} = value;
//
//         try {
//             const klineList = await getDayKline(date);
//             await updateData({date}, {list}, {dbName, collectName});
//         } catch (e) {
//             console.log(9911, e);
//             errList.push(value);
//         }
//         iteratorItem = iterator.next();
//     }
//
//     console.info(`Execute Success and err list: `, errList);
// })();

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
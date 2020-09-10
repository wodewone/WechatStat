const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment');

const makeCharts = require('../charts/makeCharts.js');
const {setDbName, insertData, updateDayKline, queryData} = require('../plugin/handlerDatabase');

const volPath = path.join(__dirname, 'data');
if (!fs.existsSync(volPath)) {
    fs.mkdirSync(volPath);
}

const otcPath = path.join(__dirname, 'otc');
if (!fs.existsSync(otcPath)) {
    fs.mkdirSync(otcPath);
}

/**
 * get date
 * @param format YYYY MM DD
 * @param date 日期 (格式 20190101 || 2019-01-01 || 2019/01/01)
 * @returns {string}
 */
function getDateType(format = 'YYYYMMDD', date) {
    try {
        if (date && moment(date).isValid()) {
            return moment(date).format(format);
        } else {
            return moment().format(format);
        }
    } catch (e) {
        return moment().format(format);
    }
}

let checkData = {
    checkFileDir(_path) {
        try {
            const fileDir = getDateType('YYYYMM');
            const dirName = path.join(_path, fileDir);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName);
            }
            const file = path.join(dirName, `${getDateType()}.json`);
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, '');
            }
            return file;
        } catch (e) {
            console.error(`checkFileDir = ${_path}: `);
            return false;
        }
    },
    setData2Local(fileData = {}, fileName) {
        if (fileName) {
            let jsonStr = JSON.stringify(fileData);
            let fileLen = (fs.readFileSync(fileName) || '').toString().length;
            if (fileLen > 2) {
                jsonStr = ',' + jsonStr;
            }
            fs.appendFileSync(fileName, jsonStr);
        }
    },
    async setData2Cloud(doc, db) {
        setDbName(db);
        await insertData(doc);
        await updateDayKline(doc);
    },
    async setVolFileDate() {
        let data = await this.getApiData('vol');
        const fileName = this.checkFileDir(volPath);
        if (data) {
            const finalData = {time: +new Date(), data};
            this.setData2Local(finalData, fileName);
            this.setData2Cloud(finalData, 'hb');
        }
    },
    async setOtcFileDate() {
        let data = await this.getApiData('otc');
        const fileName = this.checkFileDir(otcPath);
        if (data) {
            const finalData = {time: +new Date(), data};
            this.setData2Local(finalData, fileName);
            this.setData2Cloud(finalData, 'hbOtc');
        }
    },
    async getApiData(type) {
        try {
            if (type === 'vol') {
                const list = [
                    'www.huobi.fm',
                    'www.huobi.me',
                    'www.huobi.ec',
                    'www.huobi.com.vn',
                    'www.huobi.com.gi',
                    'www.huobi.uk.com',
                    'www.huobi.li',
                    'www.huobi.com.bi',
                    'www.huobi.ci',
                    'www.huobi.gf',
                    'www.huobi.as',
                    'www.huobi.pr',
                ].map(url => axios.get(`https://${url}/-/x/pro/v1/hbg/get/volume?v=${Math.random()}`));
                const {data: {data}} = await Promise.race(list);
                return data || null;
            } else if (type === 'otc') {
                const list = [
                    'otc-api-hk.eiijo.cn',
                    'otc-api.eiijo.cn',
                ].map(url => axios.get(`https://${url}/v1/data/trade-market?coinId=2&currency=1&tradeType=sell&country=37&blockType=general&v=${Math.random()}`));
                const {data: {data}} = await Promise.race(list);
                if (data && data.length) {
                    const {price} = data[0] || {};
                    if (price) {
                        return price
                    }
                }
            }
        } catch (e) {
            console.error('>>>>>>>>>>>>>>> Get Api data error!');
        }
    },
    timeEvent() {
        this.setVolFileDate();
        this.setOtcFileDate();
        setTimeout(() => {
            this.timeEvent()
        }, 1000 * 60);
    },
};


module.exports = volume = {
    dataPath: null,
    periodArr: ['min', 'hour', 'day', 'week', 'month'],
    number2count(num) {
        if (num < 1000) {
            return num;
        }
        if (num < 1000000) {
            return parseInt(num / 1000) + 'k';
        }
        if (num < 1000000000) {
            return parseInt(num / 1000000) + 'm';
        }
        return parseInt(num / 1000000000) + 'b';
    },
    handlerFileData(data) {
        return JSON.parse('[' + data + ']');
    },
    handlerDateFormat({time, period, index, total}) {
        // if (['day', 'week', 'month'].includes(period)) {
        //     return moment(time).format('MM-DD');
        // }
        total = total - 1;
        if (total < 15) {
            return moment(time).format(period === 'min' ? 'MM-DD HH:mm' : 'MM-DD');
        } else {
            if (total < 60) {
                if ((index % 3 || (total - index) <= 2) && total !== index) {
                    return '';
                }
            } else {
                if ((index % 5 || (total - index) <= 2) && total !== index) {
                    return '';
                }
            }
        }
        return moment(time).format(period === 'min' ? 'HH:mm' : 'MM-DD');
    },
    /**
     * 处理数据源
     * @param type          数据类型    [vol, otc]
     * @param period        统计周期    [min, day, week, month]
     * @param limit         数据量，条数
     * @param density       数据频次，单位：min
     * @param date          起始数据日期    period = min时传入date有效
     * @param offset        数据偏移值
     * @param full          是否全量输出（例 需要200条数据，但是只找到100条，以空补白）
     * @returns {*}
     */
    getChartData: function ({type = 'vol', period = 'day', limit, density = 1, date = '', offset = 0, full = true}) {
        //period = period || 'day';
        //limit = limit || 10;
        //density = density || 1;
        //date = date || '';
        if (!this.periodArr.includes(period)) {
            return {};
        }
        if (type === 'vol') {
            this.dataPath = volPath;
        } else {
            this.dataPath = otcPath;
        }
        if (period !== 'min') {
            limit = limit || 10;
            date = '';
        }
        const fileData = this.getFileData({period, limit, date, full, offset});
        if (!fileData || !fileData.length) {
            return {};
        }
        let curData = fileData.filter((item, index) => {
            return !(index % density)
        });
        // let curData = [];
        // for (let i = 0; i < dataLen; i++) {
        //     // 如果找不到文件则中断
        //     let item = fileData[dataLen - 1 - density * i];
        //     if (item) {
        //         curData.push(item);
        //     } else {
        //         break;
        //     }
        // }
        if (period !== 'min') {
            curData = curData.reverse();
        }
        return curData.reduce((so, cur, index) => {
            const {time, data} = cur;
            so.labels.push(time ? this.handlerDateFormat({time, period, index, total: curData.length}) : '');
            if (type === 'vol') {
                // 处理数据单位为亿
                so.series.push(data ? (data / 100000000).toFixed(4) : '');
            }
            if (type === 'otc') {
                so.series.push(data ? (data).toFixed(4) : '');
            }
            return so;
        }, {
            labels: [],
            series: [],
        });
    },

    async getChartDataV2({type = 'vol', limit = 7} = {}) {
        const timer = +new Date();
        const list = await queryData(limit, type);
        console.info(`##### Get query Data time: (${(+new Date() - timer) / 1000})sec #####`);
        if (list && list.length) {
            const total = list.length;
            return list.reduce((so, cur, index) => {
                const {date, ave} = cur;
                const time = date + '';
                so.labels.push(this.handlerDateFormat({time, index, total}));
                if (type === 'vol') {
                    // 处理数据单位为亿
                    const num = (ave || 0).toFixed(0);
                    so.series.push((num / 1000000000).toFixed(4));
                }
                if (type === 'otc') {
                    so.series.push(ave ? (ave).toFixed(4) : '');
                }
                return so;
            }, {
                labels: [],
                series: [],
            });
        }
        return {};
    },

    handlerAveData(data, datetime) {
        if (data && data.length) {
            const total = data.reduce((so, cur) => {
                return +cur.data + so;
            }, 0);
            if (typeof total === 'number') {
                return {
                    time: datetime,
                    data: total / data.length
                }
            }
        }
        return {};
    },
    getDataMin({dirName, limit, date}) {
        const fileName = path.join(dirName, `${getDateType('YYYYMMDD', date)}.json`);
        if (fs.existsSync(dirName) && fs.existsSync(fileName)) {
            const _data = (this.handlerFileData(fs.readFileSync(fileName)) || []);
            if (limit && limit > 1) {
                return _data.slice(-limit)
            }
            return _data;
        }
        return [];
    },
    getDataHours({dirName, limit, date}) {
        const fileName = path.join(dirName, `${getDateType('YYYYMMDD', date)}.json`);
        if (fs.existsSync(dirName) && fs.existsSync(fileName)) {
            const _data = (this.handlerFileData(fs.readFileSync(fileName)) || []);
            if (limit && limit > 1) {
                return _data.slice(-limit)
            }
            return _data;
        }
        return [];
    },
    getDataDays({dirName, limit, offset, full, period}) {
        const filePeriod = {
            week: 7,
            month: 30
        };
        const periodLen = +limit || filePeriod[period] || 10;
        let response = [];
        if (fs.existsSync(dirName)) {
            let dataArr = this.getMonthFile({dirName, limit: periodLen, offset}) || [];
            response = dataArr.map((fileName) => {
                if (fileName.includes('.json')) {
                    const dir = path.join(this.dataPath, fileName.substr(0, 6));
                    const file = fs.readFileSync(path.join(dir, fileName));
                    return this.handlerAveData(this.handlerFileData(file), fileName.split('.')[0]) || {};
                }
            }).reverse();
            if (full && response.length < periodLen) {
                for (let i = periodLen - response.length; i > 0; i--) {
                    response.push({});
                }
            }
        }
        return response;
    },
    getFileData({period, limit, date, full, offset}) {
        const fileDir = getDateType('YYYYMM', date);
        const dirName = path.join(this.dataPath, fileDir);

        if (period === 'min') {
            return this.getDataMin({dirName, limit, date});
        }
        // if (period === 'hours') {
        //
        // }
        return this.getDataDays({dirName, limit, offset, full, period});
    },
    getMonthFile({dirName, limit, index = 1, data, offset}) {
        let firstData = fs.readdirSync(dirName);
        firstData = (offset && firstData) ? firstData.slice(0, -offset) : firstData;
        let dataArr = data || firstData || [];
        if (dataArr.length < limit) {
            const curDirName = path.join(this.dataPath, moment().month(moment().month() - index).startOf('month').format('YYYYMM'));
            if (!fs.existsSync(curDirName)) {
                return dataArr;
            }
            const curDataArr = fs.readdirSync(curDirName) || [];
            dataArr = [...curDataArr.slice(-(limit - dataArr.length)), ...dataArr];
            if (dataArr.length < limit) {
                index++;
                return this.getMonthFile({dirName, limit, index, data: dataArr});
            }
        }
        return dataArr;
    },
    getChartSubTitle(period, labels, date) {
        switch (period) {
            case 'min':
                return `By Huobi: ${date ? date + labels[0] : moment(new Date()).format('YYYY-MM-DD HH:mm')}`;
            case 'day':
                const range = `${labels[0]} to ${labels[labels.length - 1]}`;
                return `By Huobi: ${range}`;
            case 'week':
                return `Last week's data`;
            case 'month':
                return `Last month's data`;
            default:
                return '';
        }
    },
    async getChart({period, limit, density, date, local}) {
        // let {labels, series} = this.getChartData({period, limit, density, date, full: false});
        let {labels, series} = await this.getChartDataV2({limit, type: 'vol'});

        if (!series) {
            return '没有找到相关数据，请检查数据正确性……';
        }
        let subtitle = this.getChartSubTitle(period, labels, date);

        let mediaId = await makeCharts({
            local,
            labels,
            series: [series],
            title: 'Huobi Volume(U. 100m/USDT)',
            subtitle
        }, {fileName: 'volume'});

        if (mediaId) {
            return {
                type: "image",
                content: {
                    mediaId,
                },
            };
        } else {
            return '服务器有问题，请查看……';
        }
    },
    initDataRecord() {
        console.info(`[${moment().format()}] >Stat< start huobi volume & recorded data!`);
        checkData.timeEvent();
    },
};

// volume.getChartDataV2();

// volume.getChart({period: 'days', limit: 100, density: 1, date: '', local: 1});
// volume.getChartData({limit: '120', offset: 1, local: 1});

/* 导入[./data]数据到 mongodb Cloud [https://cloud.mongodb.com/] */
// (async function () {
//     const isOtc = 1;
//     const dataPath = isOtc ? otcPath : volPath;
//     const dir = fs.readdirSync(dataPath);
//     const filesList = dir.filter(dirName => {
//         const dirPath = path.join(dataPath, dirName);
//         return fs.statSync(dirPath).isDirectory();
//     }).map(month => {
//         const monthPath = path.join(dataPath, month);
//         const fileList = fs.readdirSync(monthPath);
//         return fileList.map(file => {
//             return {
//                 path: path.join(monthPath, file),
//                 name: file.split('.')[0]
//             };
//         });
//     });
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
//     while (!iteratorItem.done) {
//         const {value} = iteratorItem;
//         const {path, name} = value;
//
//         const content = fs.readFileSync(path);
//         const jsonArr = JSON.parse('[' + content + ']');
//
//         try {
//             // await findData('key_202009');
//             // await insertData(jsonArr, name, isOtc ? 'hbOtc' : 'hb');
//             await updateDayKline(jsonArr, name, isOtc ? 'hbOtc' : 'hb');
//         } catch (e) {
//             console.log(9911, e);
//             errList.push(value);
//         }
//
//         iteratorItem = iterator.next();
//     }
//
//     console.log(1911, errList);
// })();

/* test change dbName */
// (async function () {
//     const collectName = getCollectName('key', new Date());
//     console.log(7112, collectName);
//     const data = await findData(collectName);
//     console.log(1711, data);
// })();
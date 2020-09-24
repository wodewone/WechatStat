const fs = require('fs');
const path = require('path');
const moment = require('moment');

const makeCharts = require('../charts/makeCharts');
const Database = require('../../plugin/database');

const volPath = path.join(__dirname, 'data');
if (!fs.existsSync(volPath)) {
    fs.mkdirSync(volPath);
}

const otcPath = path.join(__dirname, 'otc');
if (!fs.existsSync(otcPath)) {
    fs.mkdirSync(otcPath);
}

const dbVol = new Database({db: 'hb'});
const dbOtc = new Database({db: 'hbOtc'});

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

    getDbType(type) {
        if (type === 'vol') {
            return dbVol
        } else {
            return dbOtc;
        }
    },

    async getChartDataV2({type = 'vol', limit = 7} = {}) {
        const timer = +new Date();
        const list = await this.getDbType(type).queryData(limit);
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
        console.info(`[${process.datetime()}] >Stat< start huobi volume & recorded data!`);
        checkData.timeEvent();
    },
};
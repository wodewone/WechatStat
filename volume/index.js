const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment');

const makeCharts = require('../charts/makeCharts.js');

const dataPath = path.join(__dirname, 'data');

if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
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

let getters = {
    newDayHour() {
        return !new Date().getHours();
    },
    dayEndHour() {
        return new Date().getHours() === 23;
    },
    newHour() {
        return !new Date().getMinutes();
    },
    newDayMin() {
        if (this.newDayHour) {
            return this.newHour();
        }
        return false;
    },
    dayEndMin() {
        if (this.dayEndHour()) {
            return new Date().getMinutes() === 59;
        }
        return false;
    },
};

let checkData = {
    checkFileDir() {
        try {
            const fileDir = getDateType('YYYYMM');
            const dirName = path.join(dataPath, fileDir);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName);
            }
            const file = path.join(dirName, `${getDateType()}.json`);
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, '');
            }
            return file;
        } catch (e) {
            console.warn('checkFileDir: ', e);
            return false;
        }
    },
    async setFileDate() {
        let response = await this.getApiData();
        const fileName = this.checkFileDir();
        if (response && fileName) {
            let fileData = {
                time: +new Date(),
                data: response,
            };
            let jsonStr = JSON.stringify(fileData);
            let fileLen = (fs.readFileSync(fileName) || '').toString().length;
            if (fileLen > 2) {
                jsonStr = ',' + jsonStr;
            }
            fs.appendFileSync(fileName, jsonStr);
        }
    },
    async getApiData() {
        try {
            const {data: {data}} = await axios.get(`https://www.huobi.vn/-/x/pro/v1/hbg/get/volume?v=${Math.random()}`);
            if (data) {
                return data;
            }
        } catch (e) {
            console.warn('>>>>>>>>>>>>>>> Get Api data error!', e);
        }
    },
    timeEvent() {
        this.setFileDate();
        setTimeout(() => {
            this.timeEvent()
        }, 1000 * 60);
    },
    init() {
        console.info('>Stat< start huobi volume & recorded data!');
        this.timeEvent();
    },
};

checkData.init();

module.exports = volume = {
    periodArr: ['min', 'day', 'week', 'month'],
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
        if (['day', 'week', 'month'].includes(period)) {
            return moment(time).format('MM-DD');
        }
        if (total <= 15) {
            return moment(time).format('MM-DD hh:mm');
        }
        if (total <= 30) {
            return moment(time).format('hh:mm');
        }
        if (total <= 100) {
            if (!(index % 5)) {
                return moment(time).format('hh:mm');
            }
            return '';
        }
    },
    /**
     * 处理数据源
     * @param period        统计周期    [min, day, week, month]
     *        min
     * @param limit         数据量，条数
     * @param density        数据频次，单位：min
     * @param date          数据日期    period = min时传入date有效
     * @returns {*}
     */
        getChartData({period = 'day', limit = 10, density = 1, date = ''}) {
        //period = period || 'day';
        //limit = limit || 10;
        //density = density || 1;
        //date = date || '';
        if (!this.periodArr.includes(period)) {
            return {};
        }
        if (period !== 'min') {
            date = '';
        }
        const fileData = this.getFileData({period, limit, date});
        if (!fileData || !fileData.length) {
            return {};
        }
        const dataLen = fileData.length;
        let curData = [];
        for (let i = 0; i < dataLen; i++) {
            // 如果找不到文件则中断
            let item = fileData[dataLen - 1 - density * i];
            if (item) {
                curData.push(item);
            } else {
                break;
            }
        }
        if (period === 'min') {
            curData = curData.reverse();
        }
        return curData.reduce((so, cur, index) => {
            const {time} = cur;
            so.labels.push(this.handlerDateFormat({time, period, index, total: limit}));
            // 处理数据单位为亿
            so.series.push((cur.data / 100000000).toFixed(4));
            return so;
        }, {
            labels: [],
            series: [],
        });
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
        return false;
    },
    getFileData({period, limit, date}) {
        const fileDir = getDateType('YYYYMM', date);
        const dirName = path.join(dataPath, fileDir);

        if (period === 'min') {
            const fileName = path.join(dirName, `${getDateType('YYYYMMDD', date)}.json`);
            if (fs.existsSync(dirName) && fs.existsSync(fileName)) {
                return this.handlerFileData(fs.readFileSync(fileName));
            }
            return false;
        }

        const filePeriod = {
            week: 7,
            month: 30
        };
        const periodLen = limit || filePeriod[period] || 10;
        let response = [];
        if (fs.existsSync(dirName)) {
            let dataArr = this.getMonthFile({dirName, limit});

            dataArr.length && dataArr.reverse().slice(0, periodLen).map((fileName) => {
                if (fileName.includes('.json')) {
                    const dir = path.join(dataPath, fileName.substr(0, 6));
                    const file = fs.readFileSync(path.join(dir, fileName));
                    const data = this.handlerAveData(this.handlerFileData(file), fileName.split('.')[0]);
                    if (data) {
                        response.push(data)
                    }
                }
            });
        }
        return response;
    },
    getMonthFile({dirName, limit, index = 1, data}) {
        let dataArr = data || fs.readdirSync(dirName) || [];
        if (dataArr.length < limit) {
            const prevDirName = path.join(dataPath, moment().month(moment().month() - index).startOf('month').format('YYYYMM'));
            const prevDataArr = fs.readdirSync(prevDirName) || [];
            dataArr = [...prevDataArr.slice(-(limit - dataArr.length)), ...dataArr];
            if (dataArr.length < limit) {
                return this.getMonthFile({dirName, limit, index: index + 1, data: dataArr});
            }
        }
        return dataArr;
    },
    getChartSubTitle(period, labels, date) {
        switch (period) {
            case 'min':
                return `By Huobi: ${moment(date || new Date()).format('YYYY-MM-DD')}`;
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
        let {labels, series} = this.getChartData({period, limit, density, date});
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
        }, {filePath: __dirname, fileName: 'volume'});
        // console.info('Make volume media ID:', mediaId);
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
    }
};

//(async () => {
//    console.info(111, await volume.getChart({period: 'day', limit: 20, density: 1, date: '', local: 1}));
//})();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require('moment');

const makeCharts = require('../charts/makeCharts.js');

const dataPath = path.join(__dirname, 'data');

if (!fs.existsSync('data')) {
    fs.mkdirSync(dataPath);
}

/**
 * get date
 * @param type ymd | ym | md
 * @returns {string}
 */
function getDate(type = 'ymd') {
    let dateTime = new Date();
    let y = dateTime.getFullYear().toString();
    let m = dateTime.getMonth() < 10 ? '0' + dateTime.getMonth() : dateTime.getMonth();
    let d = dateTime.getDate().toString();
    if (type === 'ymd')
        return y + m + d;
    if (type === 'ym')
        return y + m;
    if (type === 'md')
        returnm + d
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
            const fileDir = getDate('ym');
            const dirName = path.join(dataPath, fileDir);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName);
            }
            const file = path.join(dirName, `${getDate()}.json`);
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
            const {data: {data}} = await axios.get(`https://www.huobi.br.com/-/x/pro/v1/hbg/get/volume?v=${Math.random()}`);
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
        console.info('Start time & recorded data!');
        this.timeEvent();
    },
};

checkData.init();

module.exports = volume = {
    number2count(num){
        if(num < 1000){
            return num;
        }
        if(num < 1000000){
            return parseInt(num / 1000) + 'k';
        }
        if(num < 1000000000){
            return parseInt(num / 1000000) + 'm';
        }
        return parseInt(num / 1000000000) + 'b';
    },
    handlerFileData(data) {
        return JSON.parse('[' + data + ']');
    },
    handlerDateFormat(time, index, total) {
        if(total <= 10){
            return moment(time).format('MM-DD hh:mm');
        }
        if(total <= 100){
            if(!(index % 5)){
                return moment(time).format('hh:mm');
            }
            return '';
        }
    },
    /**
     * 处理数据源
     * @param limit         数据量，条数
     * @param dateCount     数据频次，单位：min
     */
    handlerTimeData(fileData, limit = 10, dataCount = 1) {
        if (!fileData || !fileData.length) {
            return false;
        }
        let curData = [];
        let dataLen = fileData.length;
        for (let i = 0; i < limit; i++) {
            let item = fileData[dataLen - 1 - dataCount * i];
            if (item) {
                curData.push(item);
            } else {
                break;
            }
        }
        return curData.reverse().reduce((so, cur, index) => {
            so.labels.push(this.handlerDateFormat(cur.time, index, limit));
            so.series.push(parseInt(cur.data/1000000));
            return so;
        }, {
            labels: [],
            series: [],
        });
    },
    getFileData(type = 'day', date) {
        const fileDir = getDate('ym');
        const dirName = path.join(dataPath, fileDir);
        const fileName = path.join(dirName, `${getDate()}.json`);
        if (type === 'day') {
            if (fs.existsSync(dirName) && fs.existsSync(fileName)){
                return this.handlerFileData(fs.readFileSync(fileName));
            }
            return false;
        }
        if (type === 'mounth') {
            if (fs.existsSync(dirName) && fs.existsSync(fileName)) {
                const dataArr = fs.readdirSync(dirName);
                let data = [];
                dataArr.length && dataArr.map((fileName) => {
                    if (fileName.includes('.json')) {
                        const file = fs.readFileSync(path.join(dirName, fileName));
                        data.push(this.handlerFileData(file));
                    }
                });
                return data;
            }
        }
    },
    async getChartData() {
        let fileData = this.getFileData('day');
        let chartData = fileData && this.handlerTimeData(fileData, 100);
        let {labels, series} = chartData;
        series = [series];
        let mediaId = await makeCharts({labels, series, title: 'Huobi 24H Volume(U.M/usdt)'});
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
};

// (async ()=> {
//     console.info(await volume.getChartData());
// })();
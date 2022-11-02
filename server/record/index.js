const fs = require('fs');
const path = require('path');
const axios = require('axios');

const {HBVOLURL, HBOTCURL} = require('server/config');
const Database = require('plugin/database');

const dbVol = new Database({db: 'hb'});
const dbOtc = new Database({db: 'hbOtc'});

const VOLUME = {
    checkFileDir(_path) {
        try {
            const fileDir = process.datetime('YYYYMM');
            const dirName = path.join(_path, fileDir);
            if (!fs.existsSync(dirName)) {
                fs.mkdirSync(dirName);
            }
            const file = path.join(dirName, `${process.datetime('YYYYMMDD')}.json`);
            if (!fs.existsSync(file)) {
                fs.writeFileSync(file, '');
            }
            return file;
        } catch (e) {
            process.log.error('Check File Dir', `_path = ${_path}: `);
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
    async setVolFileDate() {
        let data = await this.getVolData('vol');
        if (data) {
            const doc = {time: +new Date(), data};
            // this.setData2Local(doc, this.checkFileDir(volPath));
            await dbVol.getDbInstance();
            await dbVol.addDoc2Cloud(doc);
        }
    },
    async setOtcFileDate() {
        let data = await this.getOtcData('otc');
        if (data) {
            const doc = {time: +new Date(), data};
            // this.setData2Local(doc, this.checkFileDir(otcPath));
            await dbOtc.getDbInstance();
            await dbOtc.addDoc2Cloud(doc);
        }
    },
    async getVolData(force) {
        try {
            const list = HBVOLURL.map(url => axios.get(`https://${url}/-/x/pro/v1/hbg/get/volume`).catch());
            const {data: {data} = {}} = await Promise.race(list).catch(() => ({}));
            console.info(99990061, data);
            if (data) {
                return data;
            }
        } catch (e) {
            process.log.error('getVolData', e);
        }
    },
    async getOtcData(force) {
        try {
            const list = HBOTCURL.map(url => axios.get(`https://${url}/v1/data/trade-market?coinId=2&currency=1&tradeType=sell&country=37&blockType=general`).catch());
            const {data: {data} = {}} = await Promise.race(list).catch(() => ({}));
            console.info(99990073, data);
            if (data && data.length) {
                const {price} = data[0] || {};
                if (price) {
                    return price
                }
            }
        } catch (e) {
            process.log.error('getOtcData', e);
        }
    },
    timeEvent() {
        this.setVolFileDate().catch(e => process.log.error('timeEvent', 'vol ', e));
        this.setOtcFileDate().catch(e => process.log.error('timeEvent', 'otc ', e));
        setTimeout(() => {
            this.timeEvent()
        }, 1000 * 60);
    },
};

VOLUME.timeEvent();

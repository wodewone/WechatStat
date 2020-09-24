const fs = require('fs');
const path = require('path');
const axios = require('axios');

const {HBVOLURL, HBOTCURL} = require('../config');
const Database = require('../../plugin/database');

require('../../plugin/prefix');

const dbVol = new Database({db: 'hb'});
const dbOtc = new Database({db: 'hbOtc'});

const VOLUME = {
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
            console.error(`[${process.datetime()}] CheckFileDir = ${_path}: `);
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
            await dbVol.addDoc2Cloud(doc);
        }
    },
    async setOtcFileDate() {
        let data = await this.getOtcData('otc');
        if (data) {
            const doc = {time: +new Date(), data};
            // this.setData2Local(doc, this.checkFileDir(otcPath));
            await dbOtc.addDoc2Cloud(doc);
        }
    },
    async getVolData(force) {
        try {
            const list = HBVOLURL.map(url => axios.get(`https://${url}/-/x/pro/v1/hbg/get/volume`).catch());
            const {data: {data}} = await Promise.race(list).catch((e) => {
                if (!force) {
                    console.error(`[${process.datetime()}] [API ERROR] [vol]`);
                    return this.getVolData(1);
                }
            });
            if (data) {
                return data;
            }
        } catch (e) {
            console.error(`[${process.datetime()}] [API ERROR] [VOL]`);
        }
    },
    async getOtcData(force) {
        try {
            const list = HBOTCURL.map(url => axios.get(`https://${url}/v1/data/trade-market?coinId=2&currency=1&tradeType=sell&country=37&blockType=general`));
            const {data: {data}} = await Promise.race(list).catch((e) => {
                if (!force){
                    console.error(`[${process.datetime()}] [API ERROR] [otc]`);
                    return this.getOtcData(1);
                }
            });
            if (data && data.length) {
                const {price} = data[0] || {};
                if (price) {
                    return price
                }
            }
        } catch (e) {
            console.error(`[${process.datetime()}] [API ERROR] [OTC]`);
        }
    },
    timeEvent() {
        this.setVolFileDate().catch(e => e);
        this.setOtcFileDate().catch(e => e);
        setTimeout(() => {
            this.timeEvent()
        }, 1000 * 60);
    },
};

VOLUME.timeEvent();
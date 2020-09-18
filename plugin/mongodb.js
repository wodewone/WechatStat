const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

// TODO:【cloud】URL https://cloud.mongodb.com/

let dbInstance = {};

module.exports = {
    /**
     * 获得数据库连接
     * @param dbName
     * @param force
     * @returns {Promise<boolean|*>}
     */
    instance: async (dbName = 'huobi', force = false) => {
        const st = +new Date();
        if (!dbInstance[dbName] || force) {
            console.info(`[${process.datetime()}] Start connection [${dbName}]`);
            try {
                // const URL = 'mongodb://localhost:27017/' + dbName;
                const URL = `mongodb+srv://root:root@huobi.l4yiu.mongodb.net/${dbName}?retryWrites=true&w=majority`;
                dbInstance[dbName] = await MongoClient.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true});
                console.info(`[${process.datetime()}] Connection Database [${dbName}] time to (${(+new Date() - st) / 1000})sec`);
            } catch (e) {
                console.error(`[${process.datetime()}] [Mongodb] connection [${dbName}] error`, e);
                dbInstance[dbName] && dbInstance[dbName].close();
                return false;
            }
        }
        return dbInstance[dbName];
    }
};
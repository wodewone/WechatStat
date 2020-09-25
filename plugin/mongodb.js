const MongoClient = require('mongodb').MongoClient;

// TODO:【cloud】URL https://cloud.mongodb.com/

const dbInstance = {};

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
            process.console.info('MongoDb', `Start connection [${dbName}]`);
            try {
                // const URL = 'mongodb://localhost:27017/' + dbName;
                const URL = `mongodb+srv://root:root@huobi.l4yiu.mongodb.net/${dbName}?retryWrites=true&w=majority`;
                const client = await MongoClient.connect(URL, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                dbInstance[dbName] = client.db(dbName);
                process.console.info('MongoDb', `Connection Database [${dbName}] time to (${(+new Date() - st) / 1000})sec`);
            } catch (e) {
                process.console.error('MongoDb', `connection [${dbName}] error`, e);
                dbInstance[dbName] && dbInstance[dbName].close();
                return false;
            }
        }
        return dbInstance[dbName];
    }
};
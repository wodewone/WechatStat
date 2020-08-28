const MongoClient = require('mongodb').MongoClient;

let dbInstance = {};
module.exports = {
    instance: async (dbName = 'huobi') => {
        if (!dbInstance[dbName]) {
            console.info('##### Start connection database!! #####');
            try {
                // const URL = 'mongodb://localhost:27017/' + dbName;
                const URL = `mongodb+srv://root:root@huobi.l4yiu.mongodb.net/${dbName}?retryWrites=true&w=majority`;
                dbInstance[dbName] = await MongoClient.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true});
            } catch (e) {
                console.warn('##### Connection database error!! #####');
                dbInstance[dbName] && dbInstance[dbName].close();
                return false;
            }
        }
        return dbInstance[dbName];
    }
};
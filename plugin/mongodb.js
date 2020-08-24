const MONGODB = require('mongodb').MongoClient;

let db = null;
module.exports = {
    instance: async (dbName = 'huobi') => {
        if (!db) {
            console.info('##### Start connection database!! #####');
            try {
                const URL = 'mongodb://localhost:27017/' + dbName;
                db = await MONGODB.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true});
            } catch (e) {
                console.warn('##### Connection database error!! #####');
                db && db.close();
                return false;
            }
        }
        return db;
    }
};
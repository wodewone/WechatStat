const MONGODB = require('mongodb').MongoClient;

const DBNAME = 'blockchain';
const URL = 'mongodb://localhost:27017/' + DBNAME;

const database = async ({collectName = 'huobi', }) => {
    let connect;
    try {
        connect = await MONGODB.connect(URL, {useNewUrlParser: true});
    } catch (e) {
        console.warn('Connection database error!!');
        connect && connect.close();
        return false;
    }
    const db = connect.db(DBNAME);
    const base = db.collection(collectName);

    console.info('check db validate? ', base);
    return {
        async add(document) {
            const res = await base.insertMany(document);
            console.info('Database: ', 'add', res);
            return res;
        },
        async find (query = null) {
            const res = await base.find(query).toArray();
            console.info('Database: ', 'find', res);
            return res;
        },
    };
};

module.exports = database;
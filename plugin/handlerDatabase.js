const database = require('./mongodb');

const fun = async () => {
    const db = await database('huobi');

    console.info(1921, db);
};

fun();
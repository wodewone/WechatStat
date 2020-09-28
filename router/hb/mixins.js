module.exports = async (ctx) => {
    const {query: {limit} = {}, request: {url = ''}} = ctx;
    const [type] = url.split('/').slice(-1);
    const {getData} = require(`server/${type}`);
    return getData(limit);
};
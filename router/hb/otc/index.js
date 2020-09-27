const {getTypeChartData} = require('server/mixins');

module.exports = async (ctx) => {
    const {query: {limit} = {}, request: {url = ''}} = ctx;
    const [type] = url.split('/').slice(-1);
    ctx.body = await getTypeChartData(type, limit);
};
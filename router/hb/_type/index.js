module.exports = async (ctx) => {
    const {params: {type}, query: {limit, chart}} = ctx;
    const serve = require(`server/${type}`);
    if (chart)
        ctx.body = await serve.getChartData(limit);
    else
        ctx.body = await serve.getData(limit);
};
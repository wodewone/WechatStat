module.exports = async (ctx) => {
    const {params: {type}, query: {limit, chart}} = ctx;
    const {getData, getChartData} = require(`server/${type}`);
    if (chart)
        ctx.body = await getData(limit);
    else
        ctx.body = await getChartData(limit)
};
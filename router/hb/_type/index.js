module.exports = async (ctx) => {
    const {params: {type}, query: {limit}} = ctx;
    const {getData} = require(`server/${type}`);
    ctx.body = await getData(limit);
};
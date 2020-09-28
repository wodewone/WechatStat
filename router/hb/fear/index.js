const mixins = require('../mixins');

module.exports = async (ctx) => {
    ctx.body = await mixins(ctx).catch(e => e);
};
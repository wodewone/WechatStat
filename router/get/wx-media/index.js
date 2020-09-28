const {getWxMedia} = require('server/mixins');

module.exports = async (ctx) => {
    const {query: {type = 'fear'} = {}} = ctx;
    ctx.body = await getWxMedia(type, 100);
};
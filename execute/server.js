require('plugin/prefix');

const mock = {
    async fear(limit){
        const Fear = require('server/fear');
        const v = await Fear.getImg(limit);
        console.info(771, v);
    },
    async vol(limit){
        const vol = require('server/volume');
        const v = await vol.getImg(limit);
        console.info(881, v);
    },
    async market(limit){
        const vol = require('server/market');
        const v = await vol.getImg(limit);
        console.info(991, v);
    },
};


mock.market(10);
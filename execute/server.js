require('plugin/prefix');

const mock = {
    async fear(limit){
        const Fear = require('server/fear');
        const v = await Fear.getImg(limit);
    },
    async vol(limit){
        const vol = require('server/volume');
        const v = await vol.getImg(limit);
    },
    async market(limit){
        const vol = require('server/market');
        const v = await vol.getImg(limit);
    },
};


mock.market(10);
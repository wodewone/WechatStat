const server = {
    PORT: 80,
};

const wechatConfig = {
    token: 'wodewone',
    appid: 'wx4c2452c3b5b8f406',
    secret: 'ea0bf9fd347de3c2ce04e65b19641926',
    encodingAESKey: 'LLETB4SMUikbSU25uGsVwizb6AGmio4tCVS1BsgUM7D',
    checkSignature: true, // 可选，默认为true。由于微信公众平台接口调试工具在明>文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

const staticServer = {
    HOME: process.env.production ? '/home/www/' : '/Users/liuzuoquan/Huobi/github/wodewone.github.io',
};

module.exports = {
    wechatConfig,
    server,
    staticServer
};
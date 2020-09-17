const server = {
    PORT: 8088,
};

const wechatConfig = {
    token: 'wodewone',
    appid: 'wx4c2452c3b5b8f406',
    encodingAESKey: 'LLETB4SMUikbSU25uGsVwizb6AGmio4tCVS1BsgUM7D',
    checkSignature: true, // 可选，默认为true。由于微信公众平台接口调试工具在明>文模式下不发送签名，所以如要使用该测试工具，请将其设置为false
};

module.exports = {
    wechatConfig,
    server,
};
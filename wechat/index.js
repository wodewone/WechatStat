const {
    // Contact,
    // Message,
    ScanStatus,
    WechatyBuilder,
    log
} = require('wechaty');

const qrcodeTerminal = require("qrcode-terminal");

function onScan(qrcode, status) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
        ].join('')
        log.info('StarterBot: ', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)

        qrcodeTerminal.generate(qrcode, {small: true})

    } else {
        log.info('StarterBot: ', 'onScan: %s(%s)', ScanStatus[status], status)
    }
}

function onLogin(user) {
    log.info("StarterBot: ", "%s is login...", user);
}

function onLogout(user) {
    log.info("StarterBot: ", "%s is logout!!!", user);
}

async function onMessage(msg) {
    log.info("StarterBot: ", msg.toString());
    if (msg.text() === 'ding') {
        await msg.say('dong')
    }
}

const name = "conan-wechat";
const puppet = "wechaty-puppet-wechat";
const bot = WechatyBuilder.build({name, puppet});
bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)

bot.start()
    .then(() => log.info('StarterBot: ', 'Starter Bot Started.'))
    .catch(e => log.error('StarterBot: ', e))

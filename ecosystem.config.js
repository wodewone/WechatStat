/**
 @type apps: []
 args: param1=value1&param2=value2&...
 */

module.exports = {
    apps: [
        {
            name: 'Server',
            script: 'app.js',
            args: '',
            instances: 1,
            autorestart: true,
            watch: false,
            min_uptime: 10000,
            max_restarts: 5,
            max_memory_restart: '150M',
            env: {
                NODE_ENV: 'development',
                NODE_PATH: './'
            },
            env_production: {
                NODE_ENV: 'production',
                NODE_PATH: './'
            }
        },
        {
            name: 'Record',
            script: 'appRecord.js',
            args: '',
            instances: 1,
            autorestart: true,
            watch: false,
            min_uptime: 10000,
            max_restarts: 5,
            max_memory_restart: '150M',
            env: {
                NODE_ENV: 'development',
                NODE_PATH: './'
            },
            env_production: {
                NODE_ENV: 'production',
                NODE_PATH: './'
            }
        },
        {
            name: 'WechatBot',
            script: './wechat/index.js',
            args: '',
            instances: 1,
            autorestart: false,
            watch: false,
            min_uptime: 60000,
            max_restarts: 5,
            max_memory_restart: '250M',
            env: {
                NODE_ENV: 'development',
                NODE_PATH: './'
            },
            env_production: {
                NODE_ENV: 'production',
                NODE_PATH: './'
            }
        },
    ],

    deploy: {
        production: {
            user: 'node',
            host: '212.83.163.1',
            ref: 'origin/master',
            repo: 'git@github.com:repo.git',
            path: '/var/www/production',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
        }
    }
};

### README

使用微信公众号查看统计数据
需先申请微信公众号（类型不限，个人，企业均可）

## START

启动进程文件

```npm i```
本地开发
```npm run dev```

生产环境
```npm run prd```

在线查看 PM2 运行状态
https://app.pm2.io/

### Update

- 2020-08-24 增加数据库存储数据（Mongodb）

### Structure Tree

```bash
WechatStat
├─README.md
├─app.js
├─appRecord.js
├─ecosystem.config.js
├─package-lock.json
├─package.json
├─server
|   ├─config.js
|   ├─index.js
|   ├─mixins.js
|   ├─volume
|   |   ├─getVolume.js
|   |   ├─index.js
|   |   ├─old.js
|   |   ├─otc
|   |   |  ├─202009
|   |   |  |   └20200918.json
|   |   ├─data
|   |   |  ├─202009
|   |   |  |   └20200918.json
|   ├─otc
|   |  └index.js
|   ├─market
|   |   ├─ACCESS_TOKEN.dog
|   |   └index.js
|   ├─fear
|   |  ├─ACCESS_TOKEN.dog
|   |  └index.js
|   ├─charts
|   |   └makeCharts.js
├─router
|   ├─README.md
|   ├─index.js
|   ├─router.config.js
|   ├─hb
|   | ├─_type
|   | |   └index.js
|   ├─get
|   |  ├─wx-media
|   |  |    └index.js
|   |  ├─chart
|   |  |   └index.js
├─plugin
|   ├─database.js
|   ├─f2Charts.js
|   ├─mongodb.js
|   ├─prefix.js
|   ├─utils.js
|   ├─upload2wx
|   |     ├─ACCESS_TOKEN.dog
|   |     ├─accessToken.js
|   |     └index.js
├─execute
|    ├─database.js
|    ├─pm2demo.js
|    ├─server.js
|    └volume.js
├─config
|   └index.js
```

`treer -i "/^node_modules|chartsImg|^\.[\w+]/"`

### Record

[Node Chart工具](https://itbilu.com/nodejs/npm/BkCASacpm.html)

[PM2基础使用](https://juejin.im/post/5be406705188256dbb5176f9)

[Linux SSR](https://smileorigin.site/2018/12/21/Linux/Linux%20SSR/)

[关于Node进程管理器PM2使用技巧和需要注意的地方](https://github.com/jawil/blog/issues/7)

### API 
[【PM2】](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)

[【mongodb docs】]( https://docs.mongodb.com/v4.2/reference/method/js-collection/)

[【mongodb-node docs】]( http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html)

[【decimal.js docs】]( http://mikemcl.github.io/decimal.js/)

[【mongodb 中文 docs】]( https://www.docs4dev.com/docs/zh/mongodb/v3.6/reference/reference-method-db.collection.find.html)

### Question

1. HTTP 返回图片不存储直接返回 stream

canvas画图表保存成图片，然后 http 请求返回图片类型  
`/v1/get/chart?limit=100&type=volume`  
根据请求参数生成对应类型的数据图表  
之前是生成图片后存储返回图片路径，然后 `ctx.body = fs.createReadStream(filePath)`  
但是存储的图片也没有其他用处，增加写入-读取的过程既浪费内存又浪费时间，  
并且`ctx.body`可以接受 stream，尝试一堆后直接 `ctx.body = canvas.createPNGStream()`
  
> 详见 `./router/get/chart/index.js`


2. NODE require本地模块使用 '绝对路径'

大多范例中 `node` 模块会使用**相对路径**基于当前当前文件进行引用，  
但是实际中这样使用很不方便，尤其引用的路径嵌套比较深  
`require(../../../../)` ?????  
其实`node`中有相关方式来处理相关问题 = `NODE_PATH` （这里简单介绍用法，详情官方文档）

> 描述一段示例，现有项目结构如下  
```bash
app
├─index.js
├─utils.js
├─plugin
|  ├─test1
|  |   └test1.js
|  ├─test2
|  |   └test2.js
```

> index.js  
```javascript
require('./plugin/test1/test1.js')
```

> test1.js  
```javascript
require('../../utils.js')
```

> *test2.js* 中引用 *test1.js*
```javascript
require('../test1/test1.js')
```

然后运行`index.js`
```bash
node index.js
```

修改启动方式  
```bash
NODE_PATH=./ node app.js
```
> ./` 表示当前运行目录  

即从当前运行目录开始检索引用模块，然后
> *test1.js* 修改为  
```javascript
require('utils.js')
```
> *test2.js* 修改为  
```javascript
require('plugin/test1/test1.js')
```

> ~简单直观  
> pm2 可以在配置文件中添加，详见 `./ecosystem.config.js`
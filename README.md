### README

使用微信公众号查看统计数据
> 需先申请微信公众号（类型不限，个人，企业均可）

## START

启动进程文件

```npm i```

```npm run pm2```

### Update

- 2020-08-24 增加数据库存储数据（Mongodb）

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

> canvas画图表保存成图片，然后 http 请求返回图片类型  
> `/v1/get/chart?limit=100&type=volume`  
> 根据请求参数生成对应类型的数据图表  
> 之前是生成图片后存储返回图片路径，然后 `ctx.body = fs.createReadStream(filePath)`   
> 但是存储的图片也没有其他用处，增加写入-读取的过程既浪费内存又浪费时间，  
> 并且`ctx.body`可以接受 stream，尝试一堆索性 `ctx.body = canvas.createPNGStream()`  
> `/router/get/chart/index`
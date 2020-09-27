## Router

> 路由规则

在`/router`下创建文件夹生成对应路径的路由  
如：
```bash
router
├─get
|  ├─value
|  ├─chart
|  |   └index.js
```
对应有效路由为  
`[ 'get/chart' ]`

其中`value`为无效路由

即对应目录下需要有`index.js`才有效，  
```javascript
module.exports = (ctx) => {
    // 对应路由的操作
}
```
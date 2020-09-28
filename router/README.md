## Router

> 路由规则

在`/router`下创建文件夹生成对应路径的路由  
如：
```bash
router
├─get
|  ├─value
|  ├─data
|  |   └index.js
|  ├─_param
|  |   └index.js
```
对应有效路由为:  
`[ 'get/data', 'get/:param' ]`

其中`value`目录为无效路由  
即对应目录下需要有`index.js`才有效  

`_param` 为动态路由  
即目录名称为 `_` 开头的是动态路由
  
```javascript
module.exports = (ctx) => {
    // 对应路由的操作
}
```
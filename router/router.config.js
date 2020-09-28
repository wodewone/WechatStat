const fs = require('fs');
const path = require('path');

const checkValid = (_path) => {
    return fs.readdirSync(_path).find(name => name === 'index.js');
};

/**
 * 生成路由配置
 * @param dirPath
 * @returns {*[{path=routePath,route=routeName}]}
 */
const getRouterTree = (dirPath) => {
    const dir = fs.readdirSync(dirPath);
    return dir.reduce((so, file) => {
        const _path = path.join(dirPath, file);
        if (fs.statSync(_path).isDirectory()) {
            const child = getRouterTree(_path);
            const route = file.replace('_', ':');
            if (child.length) {
                const pathList = child.map(next => ({
                    "file": file + '/' + next.file,
                    "route": route + '/' + next.route,
                }));
                so.push(...pathList);
            } else {
                so.push({file, route});
            }
        }
        return so;
    }, []);
};

/**
 * 遍历 dirPath 目录生成路由
 * @param dirPath
 * @returns {boolean|*[]}
 */
module.exports = (dirPath = __dirname) => {
    const dir = fs.readdirSync(dirPath);
    if (!dir || !dir.length) {
        return false;
    }

    return getRouterTree(dirPath).filter(({file}) => {
        const _p = path.join(dirPath, file);
        return checkValid(_p);
    });
};
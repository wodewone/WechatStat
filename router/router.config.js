const fs = require('fs');
const path = require('path');

const checkValid = (_path) => {
    return fs.readdirSync(_path).find(name => name === 'index.js');
};

const getRouterTree = (dirPath) => {
    const dir = fs.readdirSync(dirPath);
    return dir.reduce((so, name) => {
        const _path = path.join(dirPath, name);
        if (fs.statSync(_path).isDirectory()) {
            const child = getRouterTree(_path);
            if (child.length) {
                const fullPath = child.map(c => name + '/' + c);
                so.push(...fullPath);
            } else {
                so.push(name);
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

    return getRouterTree(dirPath).filter(_path => {
        const _p = path.join(dirPath, _path);
        return checkValid(_p);
    });
};
// volume.getChartDataV2();

// volume.getChart({period: 'days', limit: 100, density: 1, date: '', local: 1});
// volume.getChartData({limit: '120', offset: 1, local: 1});

/* 导入[/data]数据到 mongodb Cloud [https://cloud.mongodb.com/] */
// (async function () {
//     const isOtc = 1;
//     const dataPath = isOtc ? otcPath : volPath;
//     const dir = fs.readdirSync(dataPath);
//     const filesList = dir.filter(dirName => {
//         const dirPath = path.join(dataPath, dirName);
//         return fs.statSync(dirPath).isDirectory();
//     }).map(month => {
//         const monthPath = path.join(dataPath, month);
//         const fileList = fs.readdirSync(monthPath);
//         return fileList.map(file => {
//             return {
//                 path: path.join(monthPath, file),
//                 name: file.split('.')[0]
//             };
//         });
//     });
//
//     function* iteratorFun() {
//         const len = filesList.length;
//         for (let i = 0; i < len; i++) {
//             const item = filesList[i];
//             for (let j = 0; j < item.length; j++) {
//                 yield item[j];
//             }
//         }
//     }
//
//     let iterator = iteratorFun();
//     let iteratorItem = iterator.next();
//     let errList = [];
//
//     while (!iteratorItem.done) {
//         const {value} = iteratorItem;
//         const {path, name} = value;
//
//         const content = fs.readFileSync(path);
//         const jsonArr = JSON.parse('[' + content + ']');
//
//         try {
//             // await findData('key_202009');
//             // await insertData(jsonArr, name, isOtc ? 'hbOtc' : 'hb');
//             await updateDayKline(jsonArr, name, isOtc ? 'hbOtc' : 'hb');
//         } catch (e) {
//             console.log(9911, e);
//             errList.push(value);
//         }
//
//         iteratorItem = iterator.next();
//     }
//
//     console.log(1911, errList);
// })();

/* test change dbName */
// (async function () {
//     const collectName = getCollectName('key', new Date());
//     console.log(7112, collectName);
//     const data = await findData(collectName);
//     console.log(1711, data);
// })();
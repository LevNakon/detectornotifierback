const socketpool = require('pool.socket.io');
const cacheStorage = require('./storage').cacheStorage;
const CONFIG = Object.freeze({
    START_STREAMING: 'START_STREAMING',
    STREAM_RESULT: 'STREAM_RESULT',
    LIST_WITH_COUNTS_REQ: 'LIST_WITH_COUNTS_REQ',
    LIST_WITH_COUNTS_RES: 'LIST_WITH_COUNTS_RES',
});

exports.classesSocket = function (server) {
    const connectionManager = socketpool.default(server);
    connectionManager.onConnection((connection, pool) => {

        connection.on(CONFIG.START_STREAMING, ({ email, location, classType, width, height, xCenter, yCenter, time }) => {
            let locationsObject = cacheStorage.get(email) || {};
            let isLocation = Object.keys(locationsObject)
                .find(loc => loc === location);
            if (isLocation) {
                let classesListByLocation = locationsObject[location];
                let findClassType = classesListByLocation.find(item => item.classType === classType);
                if (findClassType) {
                    findClassType.count = findClassType.count + 1;
                    findClassType.width = findClassType.width * ((findClassType.count - 1) / findClassType.count) + width / findClassType.count;
                    findClassType.height = findClassType.height * ((findClassType.count - 1) / findClassType.count) + height / findClassType.count;
                } else {
                    locationsObject[location] = [...classesListByLocation, {
                        classType,
                        count: 1,
                        width,
                        height
                    }];
                }
            } else {
                locationsObject[location] = [{
                    classType,
                    count: 1,
                    width,
                    height
                }];
            }
            if (locationsObject['stats']) {
                let statsObject = locationsObject['stats'];
                if (statsObject[classType]) {
                    let list = statsObject[classType];
                    if (list.length >= 30) {
                        let newArray = list.slice(1, 30);
                        statsObject[classType] = [...newArray, [
                            xCenter,
                            yCenter
                        ]]
                    } else {
                        statsObject[classType] = [...list, [
                            xCenter,
                            yCenter
                        ]]
                    }
                } else {
                    statsObject[classType] = [[
                        xCenter,
                        yCenter
                    ]]
                }
                locationsObject['stats'] = statsObject;
            } else {
                locationsObject['stats'] = {
                    [classType]: [[xCenter, yCenter]]
                }
            }

            cacheStorage.set(email, locationsObject);

            connection.emit(CONFIG.STREAM_RESULT, { classesListByLocation: { email, location, classType, time } });
        });

        connection.on(CONFIG.LIST_WITH_COUNTS_REQ, ({ email, location }) => {
            let locationsObject = cacheStorage.get(email) || {};
            let isLocation = Object.keys(locationsObject)
                .find(loc => loc === location);
            if (isLocation) {
                connection.emit(CONFIG.LIST_WITH_COUNTS_RES, { listWithCounts: locationsObject[location], lastStats: locationsObject['stats'] });
            } else {
                connection.emit(CONFIG.LIST_WITH_COUNTS_RES, { listWithCounts: [], lastStats: [] });
            }
        });

        connection.on('disconnect', () => {
            console.log('disconnected');
        });
    });
};
const NodeCache = require('node-cache');

class Storage {
    /**
     * @param cache {NodeCache}
     */
    constructor(cache) {
        this._cache = cache;
    }

    /**
     * @param key {string}
     * @returns {Object|undefined}
     */
    get(key) {
        return this._cache.get(key);
    }

    /**
     * @param keys {Array<string>}
     * @returns {Object|{}}
     */
    multiget(keys) {
        return this._cache.mget(keys);
    }

    /**
     * @param prop {string}
     * @param value {*}
     * @returns {Array<Object>|[]}
     */
    filterBy(prop, value) {
        const keys = this.keys();
        const cachedItems = this.multiget(keys);
        const filteredItems = [];

        if (Object.keys(cachedItems).length !== 0) {
            Object.keys(cachedItems)
                .filter((key) => {
                    if (cachedItems[key].hasOwnProperty(prop)) {
                        if (value === cachedItems[key][prop]) {
                            filteredItems.push(cachedItems[key]);
                        }
                    }
                });
        }

        return filteredItems;
    }
    /**
     * @param key {string}
     * @param value {Object}
     * @returns {boolean}
     */
    set(key, value) {
        return this._cache.set(key, value);
    }

    /**
     * @param arrayOfPairs {Array<Object>}
     * @returns {boolean}
     */
    multiset(arrayOfPairs) {
        return this._cache.mset(arrayOfPairs);
    }

    /**
     * @param key {string}
     * @returns {*} Cached value.
     */
    take(key) {
        return this._cache.take(key);
    }

    /**
     * @param key {string}
     * @returns {number}
     */
    delete(key) {
        return this._cache.del(key);
    }

    /**
     * @param keys {Array<string>}
     * @returns {number}
     */
    multidel(keys) {
        return this._cache.del(keys);
    }

    /**
     * @param key {string}
     * @returns {boolean}
     */
    has(key) {
        return this._cache.has(key);
    }

    /**
     * @returns {Array<string>}
     */
    keys() {
        return this._cache.keys();
    }

    /**
     * @returns {boolean}
     */
    flush() {
        const stats = this._cache.getStats();
        let isZero = true;
        this._cache.flushAll();
        for (const key of Object.values(stats)) {
            if (key !== 0) {
                isZero = false;
            }
        }
        return isZero;
    }
}

module.exports = {
    cacheStorage: new Storage(new NodeCache()),
};


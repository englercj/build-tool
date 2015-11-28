'use strict';

const crypto    = require('crypto');
const fs        = require('fs');
const mkdirp    = require('mkdirp');
const os        = require('os');
const path      = require('path');
const updateList = require('./update');
const log       = process.env.LOGGER || console;

class PluginCache {
    constructor(keyword, limit) {
        if (typeof keyword !== 'string') {
            log.error('Keyword is required');
            return;
        }

        this._listHash = null;
        this._cachePath = null;

        this.keyword = keyword;
        this.limit = limit || Infinity;

        this.cachePath = path.join(__dirname, '..', '..', '.cache');
    }

    get listHash() {
        return this._listHash;
    }

    get cachePath() {
        return this._cachePath;
    }

    set cachePath(value) {
        this._cachePath = path.normalize(value);
        this.checkCache();
    }

    checkCache() {
        try {
            mkdirp.sync(this._cachePath);
        }
        catch (e) {
            log.error('Unable to create cache path: %s', this._cachePath, e);
            return false;
        }

        return checkCacheFile(this._cachePath, 'list-cache.json');
    }

    createCacheStream() {
        return fs.createReadStream(this._cachePath);
    }

    update() {
        updateList(this.keyword, this.limit, (err, data) => {
            let json = JSON.stringify(data, null, 4);
            let fpath = path.join(this._cachePath, 'list-cache.json');
            this._listHash = createHash(json);

            fs.writeFile(fpath, json, (err) => {
                if (err) {
                    return log.error('Failed to write to cache file at %s', fpath, err);
                }
                log.info('Updated %s plugins', data.length);
            });
        });
    }
}

module.exports = PluginCache;

function createHash(str) {
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex');
}

function checkCacheFile(cachePath, fname) {
    let cache = path.join(cachePath, fname);

    try {
        fs.accessSync(cache, fs.R_OK | fs.W_OK);
        log.info('Cache file exists and is accessible at %s', cache);
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            log.info('Cache file %s doesn\'t exist, creating a new one.', fname);
            try {
                fs.writeFileSync(cache, '[]');
                log.info('Cache file created at %s', cache);
            }
            catch (e) {
                log.error('Unable to create cache file %s', cache, e);
                return false;
            }
        }
        else {
            log.error('Cache file %s exists but is inaccessible.', fname);
            return false;
        }
    }

    return true;
}
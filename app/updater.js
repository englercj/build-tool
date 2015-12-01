'use strict';

const fs    = require('fs');
const path  = require('path');
const AWS   = require('aws-sdk');
const async = require('async');
const env   = require('node-env-file');
const pkg   = require('../package.json');
const blacklist = require('./blacklist.json');
const PluginCache = require('../lib/plugin-cache');
const log   = process.env.LOGGER || console;

env(path.join(__dirname, '..', '.env'));

let cache = new PluginCache(pkg.toolConfig.keyword, 0, blacklist);

beginUpdate();

function beginUpdate() {
    log.info('Update starting.');

    async.waterfall([
        updateCache,
        uploadCache
    ], function () {
        log.info('Update complete.');
    });

    setTimeout(beginUpdate, 3610000); // every hour + 10 seconds
}

function updateCache(cb) {
    cache.update(cb);
}

function uploadCache(cb) {
    let key = 'list-cache.json';
    let s3obj = new AWS.S3({ params: { Bucket: 'pixi-build-tool', Key: key } });

    s3obj.upload({
        ACL: 'public-read',
        CacheControl: 'max-age=3600',
        ContentType: 'application/json',
        Body: cache.createReadStream(key)
    })
    .on('httpUploadProgress', function (evt) {
        log.info('Uploading list-cache:', evt);
    })
    .send(function (err, data) {
        if (err) {
            log.error('Error uploading list cache:', err);
        }
        else {
            log.info('List cache uploaded.\n  CDN URL: %s\n  S3 URL: %s\n  ETag: %s',
                process.env.AWS_CDN_URL + key, data.Location, data.ETag);
        }
    });
}

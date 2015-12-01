'use strict';

const async     = require('async');
const request   = require('request');
const log       = process.env.LOGGER || console;

module.exports = function (list, cb) {
    log.info('Getting downloads for %s packages', list.length);

    let count = 0;
    let url = 'https://api.npmjs.org/downloads/point/last-month/';

    async.each(list, function (plugin, _done) {
        request({ url: url + encodeURIComponent(plugin.name), json: true }, function (err, res) {
            if (!err && res.statusCode === 200) {
                plugin.downloads = res.body.downloads || 0;
                count++;
            }

            _done(null, plugin);
        });
    }, function (err) {
        if (err) {
            log.error('Could not get download counts ', err);
            return cb(err);
        }

        let message = 'Fetched download stats for %s packages';
        let skipped = list.length - count;

        if (skipped) {
            message += '. Skipped %s packages';
            log.info(message, count, skipped);
        }
        else {
            log.info(message, count);
        }

        cb(null, list);
    });
};

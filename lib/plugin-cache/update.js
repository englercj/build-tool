'use strict';

const async             = require('async');
const npmKeywordSearch  = require('./npm-keyword-search');
const npmPackageInfo    = require('./npm-package-info');
const npmDownloadCounts = require('./npm-download-counts');
const ghStats           = require('./github-stats');
const log               = process.env.LOGGER || console;

module.exports = function (keyword, limit, blacklist, cb) {
    log.info('Update: keyword: %s, GH limit: %s', keyword, limit);

    async.waterfall([
        function (_done) {
            npmKeywordSearch(keyword, blacklist, _done);
        },
        npmPackageInfo,
        npmDownloadCounts,
        function (list, _done) {
            ghStats(list, limit, _done);
        }
    ], function (err, results) {
        if (err) {
            log.error('Could not update the list: ', err);
            return cb(err);
        }

        cb(null, results);
    });
};
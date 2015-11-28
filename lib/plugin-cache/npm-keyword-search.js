'use strict';

const async         = require('async');
const npmKeyword    = require('npm-keyword');
const log           = process.env.LOGGER || console;

module.exports = function (keyword, cb) {
    log.info('Starting keyword search: %s', keyword);
    let start = Date.now();

    npmKeyword.names(keyword)
        .then(function (packages) {
            log.info('Found %s packages in %sms', packages.length, (Date.now() - start));
            cb(null, packages);
        })
        .catch(function () {
            log.error('Unable to search for keywords ', err);
            cb(err);
        })
};

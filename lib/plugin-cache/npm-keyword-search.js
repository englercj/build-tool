'use strict';

const async         = require('async');
const npmKeyword    = require('npm-keyword');
const log           = process.env.LOGGER || console;

module.exports = function (keyword, blacklist, cb) {
    log.info('Starting keyword search: %s', keyword);
    let start = Date.now();

    npmKeyword.names(keyword)
        .then(function (packages) {
            var found = packages.length;
            packages = packages.filter(function (pkg) {
                return blacklist.indexOf(pkg) === -1;
            });

            log.info('Found %s packages in %sms (%s ignored due to blacklist)',
                found, (Date.now() - start),  (found - packages.length));

            if (!packages.length) {
                var err = new Error('No packages found.');
                return cb(err);
            }

            cb(null, packages);
        })
        .catch(function (err) {
            log.error('Unable to search for keywords ', err);
            cb(err);
        })
};

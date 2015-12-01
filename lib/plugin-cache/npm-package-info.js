'use strict';

const async         = require('async');
const packageJson   = require('package-json');
const log           = process.env.LOGGER || console;

module.exports = function (list, cb) {
    log.info('Fetching package info for %s packages', list.length);
    let start = Date.now();

    async.map(list, function (plugin, _done) {
        packageJson(plugin)
            .then(function (pkg) {
                _done(null, {
                    name: pkg.name,
                    author: pkg.author,
                    description: pkg.description,
                    version: pkg['dist-tags'] && pkg['dist-tags'].latest,
                    repo: pkg.repository && pkg.repository.type === 'git' ? pkg.repository.url : false,
                    website: pkg.homepage || false,
                    updated: pkg.time.modified || pkg.time.created || ''
                });
            })
            .catch(function (err) {
                log.error('Unable to fetch package info for %s ', plugin, err);
                _done();
            });
    }, function (err, packages) {
        if (err) {
            log.error('Could not fetch package info ', err);
            return cb(err);
        }

        packages.filter(function (pkg) {
            return !!pkg;
        });

        log.info('Fetched info for %s packages in %sms', packages.length, (Date.now() - start));

        cb(null, packages);
    });
};

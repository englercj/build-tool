'use strict';

const request   = require('request');
const async     = require('async');
const gh        = require('github-url-to-object');
const merge     = require('./merge-info');

const log = process.env.LOGGER || console;

module.exports = function (list, limit, cb) {
    limit = limit || process.env.GITHUB_API_LIMIT || list.length;
    limit = list.length < limit ? list.length : limit;
    log.info('Fetching GH stats for %s packages', limit);

    let count = 0;
    let limitMessage = false;
    let start = Date.now();

    async.each(list, function (plugin, _done) {
        if (plugin.repo) {
            var url = gh(plugin.repo);

            if (url && url.user && url.repo) {
                plugin.repo = url.user + '/' + url.repo;
            }
            else {
                plugin.repo = false;
            }
        }

        if (limit && limit === count && !limitMessage) {
            log.info('Limit (%s) reached for GH API calls', limit);
            limitMessage = true;
        }

        if (!plugin.repo || (limit && limit < count)) {
            _done(null, merge(plugin));
        }
        else {
            request({
                url: 'https://api.github.com/repos/' + plugin.repo,
                json: true,
                auth: {
                    username: process.env.GITHUB_CLIENT_ID,
                    password: process.env.GITHUB_CLIENT_SECRET
                },
                headers: {
                    'accept': 'application/vnd.github.v3+json',
                    'user-agent': 'https://github.com/pixijs/build-tool'
                }
            }, function (err, res) {
                if (err || res.statusCode !== 200) {
                    return _done(null, merge(plugin));
                }

                count++;
                _done(null, merge(plugin, res.body));
            });
        }
    }, function (err) {
        if (err) {
            log.error('Could not fetch GH stats ', err);
            return cb(err);
        }

        let message = 'Fetched GH stats for %s packages in %sms';
        let skipped = list.length - count;
        let time = Date.now() - start;

        if (skipped) {
            message += '. Skipped %s packages';
            log.info(message, count, time, skipped);
        }
        else {
            log.info(message, count, time);
        }

        cb(null, list);
    });
};

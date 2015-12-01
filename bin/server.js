'use strict';

const cp        = require('child_process');
const path      = require('path');
const restify   = require('restify');
const env       = require('node-env-file');
const routes    = require('./app/routes');

env(path.join(__dirname, '..', '.env'));

// setup and run server
let server = restify.createServer({ name: 'pixi-build-tool' });

require('../app/routes')(server, cache);

server.listen(process.env.PORT || 8085);

// run the updater
cp.fork('../app/updater');

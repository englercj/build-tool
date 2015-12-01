#!/usr/bin/env node

'use strict';

// Set higher maximum http sockets
require('http').globalAgent.maxSockets = 100;
require('https').globalAgent.maxSockets = 100;

const path          = require('path');
const env           = require('node-env-file');
const pkg           = require('../package.json');
const PluginCache   = require('../lib/plugin-cache');

env(path.join(__dirname, '..', '.env'));

// Create cache and update
let cache = new PluginCache(pkg.toolConfig.keyword);

cache.update();

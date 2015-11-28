#!/usr/bin/env node

'use strict';

// Set higher maximum http sockets
require('http').globalAgent.maxSockets = 100;
require('https').globalAgent.maxSockets = 100;

const path          = require('path');
const env           = require('node-env-file');
const PluginCache   = require('../lib/plugin-cache');

env(path.join(__dirname, '..', '.env'));

// Create a cache and update
let pluginCache = new PluginCache('pixi');

pluginCache.update();

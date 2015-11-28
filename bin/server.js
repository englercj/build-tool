const restify   = require('restify');
const fs        = require('fs');
const routes    = require('./app/routes');

let server = restify.createServer({ name: 'pixi-build-tool' });



server.listen(process.env.PORT || 8085);

'use strict';

const config = require('nconf');
const env = process.env.SDH_ENV || 'default';
const file = `${process.cwd()}/config/${env}.json`;

config.file(env, { file });

module.exports = {
  migrations: ['build/src/migrations/*.js'],
  ...config.get('mysql')
};

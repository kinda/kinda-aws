'use strict';

let crypto = require('crypto');
let _ = require('lodash');
let KindaObject = require('kinda-object');
let common = require('../common');
let Client = require('./client');
let Bucket = require('./bucket');

let S3 = KindaObject.extend('S3', function() {
  // options:
  //   accessKeyId
  //   secretAccessKey
  //   region
  //   bucket
  this.creator = function(options = {}) {
    if (options.debugMode) this.debugMode = true;
    let opts = common.makeClientOptions(options);
    this.client = Client.create(opts);
    this.buckets = {};
  };

  // options:
  //   createIfMissing (default: true).
  this.getBucket = function(name, options) {
    let bucket = this.buckets[name];
    if (bucket) return bucket;
    bucket = Bucket.create(this, name, options);
    this.buckets[name] = bucket;
    return bucket;
  };

  this.deleteBucket = function *(name) {
    let bucket = this.getBucket(name, { createIfMissing: false });
    yield bucket.delete();
  };

  this.getObject = function *(bucketName, key, options) {
    let bucket = this.getBucket(bucketName);
    return yield bucket.getObject(key, options);
  };

  this.putObject = function *(bucketName, key, body, options) {
    let bucket = this.getBucket(bucketName);
    return yield bucket.putObject(key, body, options);
  };

  this.deleteObject = function *(bucketName, key, options) {
    let bucket = this.getBucket(bucketName);
    return yield bucket.deleteObject(key, options);
  };
});

S3.create = _.memoize(S3.create, function(options = {}) {
  options = JSON.stringify(options);
  options = crypto.createHash('md5').update(options).digest('hex');
  return options;
});

module.exports = S3;

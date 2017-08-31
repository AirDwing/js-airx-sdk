const request = require('./request');
const uploader = require('./uploader');

const { hmac } = require('@dwing/common');
const debug = require('debug')('@airx/sdk');

const DEFAULTS = {
  SecretId: '',
  SecretKey: '',
  Domain: 'api.airdwing.com',
  Secure: true
};

class SDK {
  constructor(options) {
    this.options = Object.assign({}, DEFAULTS, options);
    this.uploader = uploader;
  }
  getSignature(params, opts) {
    const toCheck = Object.keys(params).sort()
    .map(key => `${(key.indexOf('_') ? key.replace(/_/g, '.') : key)}=${params[key]}`).join('&');
    const signature = hmac(`${opts.method}${this.options.Domain}${opts.url}?${toCheck}`,
      this.options.SignatureMethod === 'HmacSHA256' ? 'sha256' : 'sha1', this.options.SecretKey);
    debug(`${opts.method}${this.options.Domain}${opts.url}?${toCheck}`);
    return signature;
  }
  request(data, opts) {
    const params = Object.assign({
      SecretId: this.options.SecretId,
      Timestamp: parseInt(Date.now() / 1000, 10),
      Nonce: parseInt(Math.random() * 65535, 10)
    }, data);
    params.Signature = this.getSignature(params, opts);
    debug(params);
    if (opts.method === 'GET') {
      opts.qs = params;
    } else {
      opts.form = params;
      opts.headers = [
        {
          name: 'content-type',
          value: 'application/x-www-from-urlencoded'
        }
      ];
    }
    opts.timeout = 5000;
    opts.url = `http${this.options.Secure ? 's' : ''}://${this.options.Domain}${opts.url}`;
    return request(opts);
  }
  get(url, data) {
    return this.request(data, {method: 'GET', url});
  }
  post(url, data) {
    return this.request(data, {method: 'POST', url});
  }
  upload(data, url) {
    return this.uploader(data, { method: 'POST', url });
  }
}

module.exports = SDK;

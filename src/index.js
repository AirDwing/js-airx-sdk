const request = require('request');

const { getDefer, hmac } = require('@dwing/common');
const debug = require('debug')('@airx/sdk');

const DEFAULTS = {
  SecretId: '',
  SecretKey: '',
  Domain: 'api.dwi.ng',
  Secure: true
};

class SDK {
  constructor(options) {
    this.options = Object.assign({}, DEFAULTS, options);
  }
  getSignature(params, opts) {
    const toCheck = Object.keys(params).sort()
    .map(key => `${(key.indexOf('_') ? key.replace(/_/g, '.') : key)}=${params[key]}`).join('&');
    const signature = hmac(`${opts.method}${this.options.Domain}${opts.url}?${toCheck}`,
      this.options.SignatureMethod === 'HmacSHA256' ? 'sha256' : 'sha1', this.options.SecretKey);
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
    const deferred = getDefer();
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
    request(opts, (err, res) => {
      if (err) {
        deferred.reject(err);
      }
      try {
        deferred.resolve(JSON.parse(res.body));
      } catch (e) {
        deferred.reject(err);
      }
    });
    return deferred.promise;
  }
  get(url, data) {
    return this.request(data, {method: 'GET', url});
  }
  post(url, data) {
    return this.request(data, {method: 'POST', url});
  }
}

module.exports = SDK;

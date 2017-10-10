const axios = require('axios');
const Base64 = require('crypto-js/enc-base64');
const hmacSHA1 = require('crypto-js/hmac-sha1');
const hmacSHA256 = require('crypto-js/hmac-sha256');
const debug = require('debug')('@airx/sdk');

const hmac = { sha1: hmacSHA1, sha256: hmacSHA256 };

const DEFAULTS = {
  SecretId: '',
  SecretKey: '',
  Domain: 'api.airdwing.com',
  Secure: true
};

class SDK {
  constructor(options) {
    this.options = Object.assign({}, DEFAULTS, options);
    axios.defaults.timeout = 5000;
    axios.defaults.baseURL = `http${this.options.Secure ? 's' : ''}://${this.options.Domain}`;
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  getSignature(params, opts) {
    const toCheck = Object.keys(params).sort()
      .map(key => `${(key.indexOf('_') ? key.replace(/_/g, '.') : key)}=${params[key]}`).join('&');
    const signature = Base64.stringify(hmac[
      this.options.SignatureMethod === 'HmacSHA256' ? 'sha256' : 'sha1'
    ](`${opts.method}${this.options.Domain}${opts.url}?${toCheck}`, this.options.SecretKey));
    debug(`${opts.method}${this.options.Domain}${opts.url}?${toCheck}`);
    debug(signature);
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
      return axios.get(opts.url, {
        params
      });
    }
    return axios.post(opts.url, {
      data: params
    });
  }
  get(url, data) {
    return this.request(data, { method: 'GET', url });
  }
  post(url, data) {
    return this.request(data, { method: 'POST', url });
  }
  // eslint-disable-next-line class-methods-use-this
  upload(data, url) {
    return axios.post(url, {
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

module.exports = SDK;

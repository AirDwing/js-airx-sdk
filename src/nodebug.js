// test
const axios = require('axios');
const AxiosRetry = require('axios-retry');
const Base64 = require('crypto-js/enc-base64');
const hmacSHA1 = require('crypto-js/hmac-sha1');
const hmacSHA256 = require('crypto-js/hmac-sha256');
const qs = require('qs');

const hmac = { sha1: hmacSHA1, sha256: hmacSHA256 };

const DEFAULTS = {
  SecretId: '',
  SecretKey: '',
  Domain: 'api.airdwing.com',
  Secure: true,
  filter: x => x.data,
  catch: (err) => { throw err; }
};

class SDK {
  constructor(options) {
    this.options = Object.assign({}, DEFAULTS, options);
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    AxiosRetry(axios);
  }
  getSignature(params, opts, domain) {
    const toCheck = Object.keys(params).sort()
      .map(key => `${(key.indexOf('_') ? key.replace(/_/g, '.') : key)}=${params[key]}`).join('&');
    const signature = Base64.stringify(hmac[
      this.options.SignatureMethod === 'HmacSHA256' ? 'sha256' : 'sha1'
    ](`${opts.method}${this.options[domain]}${opts.url}?${toCheck}`, this.options.SecretKey));
    return signature;
  }
  request(data, opts, domain) {
    axios.defaults.timeout = 10000;
    axios.defaults.baseURL = `http${this.options.Secure ? 's' : ''}://${this.options[domain]}`;
    const params = Object.assign({
      SecretId: this.options.SecretId,
      Timestamp: parseInt(Date.now() / 1000, 10),
      Nonce: parseInt(Math.random() * 65535, 10)
    }, data);
    params.Signature = this.getSignature(params, opts, domain);
    const request = (opts.method === 'GET') ? axios.get(opts.url, { params }) : axios.post(opts.url, qs.stringify(params));
    return request.then(this.options.filter)
      .catch(e =>
        this.options.catch(e, { method: opts.method, url: opts.url, data, domain })
      );
  }
  get(url, data, domain = 'Domain') {
    return this.request(data, { method: 'GET', url }, domain);
  }
  post(url, data, domain = 'Domain') {
    return this.request(data, { method: 'POST', url }, domain);
  }
  // eslint-disable-next-line class-methods-use-this
  upload(data, url) {
    return axios.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: true
    })
      .then(this.options.filter)
      .catch(e =>
        this.options.catch(e, { method: 'UPLOAD', url, data })
      );
  }

  uploadbig(data, url, domain = 'Domain', processCallback) {
    axios.defaults.timeout = 600000;
    axios.defaults.baseURL = `http${this.options.Secure ? 's' : ''}://${this.options[domain]}`;
    return axios.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress(e) {
        if (processCallback) {
          processCallback(e);
        }
      }
    }).then(this.options.filter).catch(e =>
      this.options.catch(e, { method: 'UPLOADBIG', url, data, domain })
    );
  }
}

module.exports = SDK;

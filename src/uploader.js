const request = require('./request');

module.exports = (data, opts) => {
  opts.url = `http${this.options.Secure ? 's' : ''}://${this.options.Domain}${opts.url || '/upload'}`;
  opts.formData = data;
  opts.headers = [
    {
      name: 'content-type',
      value: 'multipart/form-data'
    }
  ];

  opts.timeout = 5000;
  return request(opts);
};

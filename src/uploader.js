const request = require('request');
const { getDefer } = require('@dwing/common');

module.exports = function (data, opts) {
  const deferred = getDefer();
  opts.url = `http${this.options.Secure ? 's' : ''}://${this.options.Domain}${opts.url || '/upload'}`;
  opts.formData = data;
  opts.headers = [
    {
      name: 'content-type',
      value: 'multipart/form-data'
    }
  ];

  opts.timeout = 5000;
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
};

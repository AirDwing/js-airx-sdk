const request = require('request');
const {getDefer} = require('@dwing/common');

module.exports = (opts) => {
  const deferred = getDefer();
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

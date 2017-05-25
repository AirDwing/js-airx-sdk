const SDK = require('../src');

const sdk = new SDK({
  SecretId: 'xxxx',
  SecretKey: 'xxxx'
});

(async () => {
  const result = await sdk.get('/user/check', {
    username: '13212341234'
  });
  console.log(result);
})();

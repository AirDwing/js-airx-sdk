const SDK = require('../src');

const cvm = new SDK({
  SecretId: 'xxxx',
  SecretKey: 'xxxx',
  Domain: 'cvm.api.qcloud.com'
});

(async () => {
  const result = await cvm.get('/v2/index.php', {
    Action: 'DescribeInstances',
    Region: 'gz'
  });
  console.log(result);
})();

const SDK = require('../src');
const fs = require('fs');

const cvm = new SDK({
  SecretId: 'xxxx',
  SecretKey: 'xxxx'
});

(async () => {
  const result = await cvm.upload({
    auth: 'xxxx',
    type: 'orgverify',
    file: fs.createReadStream('PATH/TO/xxx.jpg')
  });
  console.log(result);
})();

## 安装

```bash
npm i --save @aird/sdk
# 或
yarn add @aird/sdk
```

## 支持方法

除get外，默认application/x-www-form-urlencoded

- get
- post
- put
- delete

## 使用

```js
const SDK = require('@aird/sdk');

const sdk = new SDK({
  SecretId: 'xxxx',
  SecretKey: 'xxxx',
  // 访问的域名:
  // Domain: 'api.airdwing.com',
  // 是否启用HTTPS:
  // Secure: true, 
  // 自定义预处理方法
  // filter: x => x.data,
  // 自定义异常捕获方法
  // catch: (err) => { throw err; }
});

(async () => {
  const result = await sdk.get('/user/check', {
    username: '13212341234'
  });
  console.log(result);
})();
```

### 文件上传

需要稍微注意一下的接口:

```js
const SDK = require('@aird/sdk');
const fs = require('fs');

const sdk = new SDK({
  SecretId: 'xxxx',
  SecretKey: 'xxxx'
});

(async () => {
  const result = await sdk.upload({
    auth: 'xxxx',
    type: 'orgverify',
    file: fs.createReadStream('PATH/TO/xxx.jpg') // 注意这里, 本地文件可以用 path.join 拼装地址,或者直接用Stream
  });
  console.log(result);
})();
```

## 无缝对接腾讯云接口

Demo:

```js
const SDK = require('@aird/sdk');

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
```


## License

Apache 2.0


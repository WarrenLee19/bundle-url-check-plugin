## Example
```shell
npm i bundle-url-check-loader -D
yarn add bundle-url-check-loader -D
pnpm i bundle-url-check-loader -D
```

**js**
```js
const checkAUrlList = [
    "http://schemas.microsoft.com/office/excel/2006/main",
    "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties",
    "https://zhihu.com",
];

for (let i = 0; i < 3; i++) {
    var a = document.createElement("a");
    a.setAttribute("href", checkAUrlList[i]);
    a.innerHTML='123s4';
    document.getElementById("body").appendChild(a);
}
```
webpack.config.js

```ts
module.exports = {
    ...
    module: {
      rules: [
          {
              test: /\.js$/,
              use:[{
                loader:"bundle-url-check-loader",
                options:{
                  url:'https://www.baidu.com',
                  reg:[/^http[s]{0,1}:\/\/schemas\.\S*/]
                }
              }],
          },
      ],
    },
    ...
   
};

or

chainConfig

config.module.rule('bundle-url').test(/\.js$/).options({
      url:'https://www.baidu.com',
        reg:[/^http[s]{0,1}:\/\/schemas\.\S*/]
    })
```
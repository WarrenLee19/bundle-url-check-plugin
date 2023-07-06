// bundle-author-loader.js
// 加载待检测的图片url，根据其返回值决定是否替换
const https = require("https");
const http = require("http");
// 会将源代码解析成 `AST`
const parser = require("@babel/parser");
// 对 `AST` 节点进行递归遍历，生成一个便于操作、转换的 `path` 对象
const traverse = require("@babel/traverse").default;
// 将 `AST` 解码生成 `js` 代码
const generator = require("@babel/generator").default;
// 校验loader传入的options
const { validate } = require("schema-utils");
const { getOptions } = require("loader-utils");
// loader options的校验规则
// options是一个object类型，有一个text属性，这属性是string类型
const schema = {
  type: "object",
  properties: {
    reg: {
      type: "array",
    },
    url: {
      type: "string",
    },
  },
};

module.exports = function (source) {
  // 获取到用户给当前 loader 传入的 options
  // webpack v5 内置了这个方法，之前需要loader-utils这个包
  const options = this.getOptions ? this.getOptions() : getOptions();
  // 对loader传入的options做校验
  validate(schema, options, "bundle-url-checked-loader");
  const reg = options.reg ? options.reg[0] : /^http[s]{0,1}:\/\/([\w.]+\/?)\S*(png|jpg|svg|image)$/;
  const url = options.url ? options.url : "";
  const ast = parser.parse(source, { sourceType: "module" });
  var callback = this.async();
  let count = 0;
  let promiseAll = [];
  traverse(ast, {
      enter(path) {
          if (
              path.node.type === "StringLiteral" &&
              reg.test(
                  path.node.value
              )
          ) {
              promiseAll[`${count}`] = new Promise((resolve, reject) => {
                const request = /^https\:\/\/\S*/.test(path.node.value) ? https : http
                const req= request.get(path.node.value,  (res) => {
                      if (res.statusCode === 404 ) {
                          path.node.value = url;
                          resolve(path.node.value);
                      } else if (res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 302) {
                          resolve(path.node.value);
                      }

                  });
                  req.on('error', (e) => {
                    path.node.value = url;
                    resolve(path.node.value);
                  });
                  
              });

              count++;
          }
      },
  });
  Promise.all(promiseAll)
      .then((result) => {
          output = generator(ast, {}, source);
          callback(null, output.code);
      })
      .catch((error) => {
          console.log(error);
      });
};

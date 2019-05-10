// const database = require('../common/database');
const http = require('http');
const urlLib = require('url');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
// var key = fs.readFileSync(path.join(__dirname, '/server.key'));
// var cert = fs.readFileSync(path.join(__dirname, '/server.cert'));
var server = http.createServer(function (request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  //解析数据
  var str = "";
  request.on('data', function (data) {
    str += data;
  });
  request.on('end', async function () {
    var obj = urlLib.parse(request.url, true);
    const url = obj.pathname.replace(/\/$/, '') || '/index.html';
    const GET = obj.query;
    const POST = querystring.parse(str);
    console.log(`GET ${url}`);
    //区分接口文件
    if (url == "/api") {
      response.setHeader('Content-Type', 'application/json;charset=UTF-8');
      let data = await database.query('select * from maomi');
      response.write(JSON.stringify(data));
      response.end();
    } else {
      let mime = "*/*";
      if (/\.js$/.test(url)) {
        mime = "application/octet-stream";
      } else if (/\.html$/.test(url)){
        mime = "text/html;charset=UTF-8";
      }
      response.setHeader('Content-Type', mime);
      //读取文件返回
      let file = path.join(__dirname, url);
      console.log(`FROM ${file}`);
      fs.exists(file, (exists) => {
        if (exists) {
          fs.readFile(file, function (err, data) {
            if (err) {
              response.statusCode = 404;
            } else if (data) {
              response.write(data);
            }
            response.end();
          });
        } else {
          response.statusCode = 404;
          response.end();
        }
      })
    }
  });
});
server.listen(4000);
console.log("listen on 4000");

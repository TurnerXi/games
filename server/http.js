var PORT = 3000; //
var http = require('http');
var url = require('url');
var fs = require('fs');
var mine = require('./mine').types; //
var path = require('path');
var args = {};
process.argv.forEach((item, idx) => {
  if (item.indexOf("--") > -1) {
    args[item.substr(2)] = process.argv[idx + 1]
  }
})
var server = http.createServer(function (request, response) {
  var pathname = url.parse(request.url).pathname;
  if (pathname == '/' || pathname == '') {
    pathname = "/index.html"
  }
  var realPath = path.join(args['path'] || ".", pathname); //这里设置自己的文件名称;
  var ext = path.extname(realPath);
  ext = ext ? ext.slice(1) : 'unknown';
  fs.exists(realPath, function (exists) {
    console.log(`GET ${realPath}`)
    if (!exists) {
      response.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      response.write("This request URL " + pathname + " was not found on this server.");
      response.end();
    } else {
      fs.readFile(realPath, "binary", function (err, file) {
        if (err) {
          response.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          response.end(err);
        } else {
          var contentType = mine[ext] || "text/plain";
          response.writeHead(200, {
            'Content-Type': contentType
          });
          response.write(file, "binary");
          response.end();
        }
      });
    }
  });
});
server.listen(args['port'] || PORT);
console.log(`base-path: ${args['path'] || "."}`)
console.log("Server runing at port: " + PORT + ".");

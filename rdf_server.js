var express = require('express');
var app = express();
var listen_port = 90;
app.configure(function () {
  app.use(
    "/", 
    express.static(__dirname + "/public")
  );
});
app.listen(listen_port);

console.log( 'Proxy started on port ' + listen_port );
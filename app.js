const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3002;
var express = require('express');
var bodyParser = require('body-parser');


var errors = [];
var records = [];
require('./config/config.js');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var fs = require('fs');
var previousLength = 0;
var currentSQL = [];

var minute = new Date();
console.log('\nSTARTED :', minute.toString("hh:mm tt"));
var second = minute.getSeconds();
minute = minute.getMinutes();
console.log('\t', minute);

var schedule = require("node-schedule");
var rule = new schedule.RecurrenceRule();
rule.second = 1;
rule.minute = 0;
rule.dayOfWeek = [0, new schedule.Range(0,6)];

var connection = null;
var mysql2 = require('mysql2');
var url = require('url');

var SocksConnection = require('socksjs');
var options, proxy;
proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL); // <-- proxy url
var username = proxy.auth.split(':')[0];
var password = proxy.auth.split(':')[1];

var SocksConnection = require('socksjs');

var mysql_server_options = {
  host: process.env.HOST,
  port: process.env.PORTE
};

var socks_options = {
  host: proxy.hostname,
  port: 1080,
  user: username,
  pass: password
};

//Start Server
var serv = app.listen(port, function(){
  console.log('App listening on port %s', serv.address().port);
  console.log('Press Ctrl+C to quit');

  // schedule.scheduleJob(rule, function(){
  //   herokutest(function(array){
  //     console.log('RULE 1 -- callback called', array);
  //       return (array);
  //   });
  // });

  app.use(bodyParser.json());
  app.post('/posting', function(request, response){
    var body = response.req.body;
    console.log(response.req.body);
    // console.log(body);
    // var body = response.req.body.Payload;
    // var txt = body.toString();
    // var js = JSON.parse(txt);
    // var d = js;
    // console.log(js);
    records.push(response.req.body);
    // res.set('Accept', '')
    response.set('Content-Type', 'application/json');
    response.send(response.req.body);
  });
  app.get('/records', function(err, res){
    var request = require('request');

    res.status(200).send(`${records}`);

  });

/////////////////////SEND a webhook -- >< Entire Table?? Offer export

});

//--------------------------mySQL-----------------------//
//ESTABLISH proxy
var establishProxy = function(callback){
  var socksConn = new SocksConnection(mysql_server_options, socks_options);

  // console.log(socksConn);
  var mysql_options =  {
    database: process.env.DB,
    user: process.env.US,
    password: process.env.PW,
    stream: socksConn
  }
  callback(mysql_options);
}

//FUNCTION ----> Run an INSERT STATEMNET/DATABASE READ
var testQuery = function(callback){
  establishProxy(function(mysql_options){
    return;
  });
}

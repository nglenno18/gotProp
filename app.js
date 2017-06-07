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
  port: process.env.PT
};

var socks_options = {
  host: proxy.hostname,
  port: 1080,
  user: username,
  pass: password
};

var target = url.parse('http://ip.jsontest.com/');
options = {
  hostname: proxy.hostname,
  port: proxy.port || 80,
  path: target.href,
  headers:{
    "Proxy-Authorization":"Basic " + (new Buffer(proxy.auth).toString("base64")),
    "Host": target.hostname
  }
};
http.get(options,function(res){
  console.log(options);
  res.pipe(process.stdout);
  return console.log("status code", res.statusCode);
})
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
    addRentRow(response.req.body, function(returned){
      console.log('RETURNED');
      if(returned){
        console.log('Success: \n', returned);
        // connection.end();
        // return res.status(200).send(returned);
      }else {
        console.log('Failed');
      }
      // return connection.end();
    });
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
var addRentRow = function(entry, callback){
  var array = [];
  console.log('\n\nADDING RENT ROW:\n\n');
  var payload = JSON.parse(entry.Payload);
  console.log('\n\n Entry : ', payload.Property);

  var obj = {
    Property: payload.Property,
    Tenant: payload.Tenant,
    pay_period: '',
    Total: '',
    Rent: '',
    Hap: '',
    TenantPortion: '',
    actual_rent: '',
    amount_paid: '',
    date_received: '',
    late_fee: '',
    final: '',
    notes: '',
    UniqueID: generateID(8),
    payment_file: ''
  }

  try {
    establishProxy(function(mysql_options){
      console.log('\n\n\n\n',mysql_options);
      var connection = mysql2.createConnection(mysql_options);

      connection.query('INSERT INTO rent(Property, Tenant, UniqueID) VALUES(\'' + obj.Property +'\', \'' + obj.Tenant +'\', \'' +
      obj.UniqueID + '\''+ ');', function(err,rows){
          arr = rows;
          console.log('Result: ', rows);
          console.log('Error: ', err);

          callback(rows);
          // return mysqlConn.end(function(err){
          //   if(err) return console.log(err);
          //   console.log('\tDatabase DISCONNECTED!');
          //   var t = new Date();
          //   console.log('\t TIME: ', t.toString("hh:mm: tt"));
          //   console.log('\n\n\n');
          //   callback(rows);
          //   //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
          // });
      });
    });
  } catch (e) {
    console.log(e);
    return '';
  }
}

var generateID = function (len) {
  var crypto = require('crypto');
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}
//ESTABLISH proxy
var establishProxy = function(callback){
  console.log('\n\n\n\nMYSQLSERVEROPTIONS: ',mysql_server_options);
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

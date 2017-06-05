const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3003;
var express = require('express');
var bodyParser = require('body-parser');

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
//
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
  app.post('/posting', function(req, res){
    var body = JSON.parse(JSON.stringify(res.req.body.Payload));

    console.log(body);
    console.log('\n\n', body.UpdateMode);
    records.push(body);

    res.set('Content-Type', 'application/json');
    // res.send(`You sent: ${req.body} to gotProperties-Rent.com`);
    res.send(`${body}`);


  });

  app.get('/records', function(err, res){
    console.log(records);
    res.status(200).send(`These are all requests so far: ${records}`);
  });
  app.get('/', function(err, res){
    res.status(200).send(`${records}`);
  });

}); //EnD APP LISTEN()



var clearTimesheets = function(callback){
  establishProxy(function(mysql_options){
    var mysqlConn = mysql2.createConnection(mysql_options);
    var arr;
    return mysqlConn.connect(function(err){
      if(err){console.log(err);}
      else{
        console.log('\n\nDatabase Connected!');
        var t = new Date();
        var tf = t.toString("MMM/DD/yy   hh:mm: aa");
        console.log('TIME: ', t.toString("hh:mm: aa"));
        console.log(tf);
        // timestamps.push(tf);

        // return mysqlConn.query('INSERT INTO timesheets VALUES(\'' + tf +' \', \'\', \'\');', function(err, rows) {
        return mysqlConn.query('DELETE FROM rent WHERE UniqueID != \'l\';', function(err, rows) {
          arr = rows;
          console.log('Result: ', rows);
          console.log('Error: ', err);

          return mysqlConn.end(function(err){
            if(err) return console.log(err);
            console.log('\tDatabase DISCONNECTED!');
            var t = new Date();
            console.log('\t TIME: ', t.toString("hh:mm: tt"));
            console.log('\n\n\n');
            callback(rows);
            //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
          });
        });
      }
    })
  });
}

var addTimesheets = function(crewsheets,callback){
  establishProxy(function(mysql_options){
    var mysqlConn = mysql2.createConnection(mysql_options);
    var arr;
    return mysqlConn.connect(function(err){
      if(err){console.log(err);}
      else{
        console.log('\n\nDatabase Connected!');
        var t = new Date();
        var tf = t.toString("MMM/DD/yy   hh:mm: aa");
        console.log('TIME: ', t.toString("hh:mm: aa"));
        console.log(tf);
        // timestamps.push(tf);

        console.log('\n\nCREWSHEETS to INPUT into SQL: ', crewsheets);
        var i = 0;
        for(i = 0; i < crewsheets.length; i++){
          var entry = crewsheets[i];
          if(i = crewsheets.length - 1){
            callback(mysqlConn.query('INSERT INTO timesheets2 VALUES(\'' + tf +'\', \'' + entry.employee +'\', \'' + entry.UniqueID +'\');', function(err, rows){
              console.log(err);
              console.log('Result: ', rows);
            }))
          }
          mysqlConn.query('INSERT INTO timesheets2 VALUES(\'' + tf +'\', \'' + entry.employee +'\', \'' + entry.UniqueID +'\');', function(err, rows){
            console.log(err);
            console.log('Result: ', rows);
          });
        }
      }
    })
  });
}

var findTimesheet = function(id, callback){
  var socksConn = new SocksConnection(mysql_server_options, socks_options);

  // console.log(socksConn);
  var mysql_options =  {
    database: process.env.DB,
    user: process.env.US,
    password: process.env.PW,
    stream: socksConn
  }

  var mysqlConn = mysql2.createConnection(mysql_options);
  var arr;
  return mysqlConn.connect(function(err){
    if(err){console.log(err);}
    else{
      console.log('\n\nDatabase Connected!');
      var t = new Date();
      var tf = t.toString("MMM/DD/yy   hh:mm: aa");
      console.log('TIME: ', t.toString("hh:mm: aa"));
      console.log(tf);
      // timestamps.push(tf);

      // return mysqlConn.query('INSERT INTO timesheets VALUES(\'' + tf +' \', \'\', \'\');', function(err, rows) {
      return mysqlConn.query('SELECT COUNT(UniqueID) FROM rent WHERE Property = \'' + property + '\' AND pay_period = \''+ pp +'\';', function(err, rows) {
        arr = rows;
        console.log('Result: ', rows);
        console.log('Error: ', err);

        return mysqlConn.end(function(err){
          if(err) return console.log(err);
          console.log('\tDatabase DISCONNECTED!');
          var t = new Date();
          console.log('\t TIME: ', t.toString("hh:mm: tt"));
          console.log('\n\n\n');
          callback(rows);
          //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
        });
      });
    }
  })
}

var addRentRow = function(entry, callback){
  establishProxy(function(mysql_options){
    var mysqlConn = mysql2.createConnection(mysql_options);
    var arr;
    return mysqlConn.connect(function(err){
      if(err){console.log(err);}
      else{
        console.log('\n\nDatabase Connected!');
        var t = new Date();
        var tf = t.toString("MMM/DD/yy   hh:mm: aa");
        console.log('TIME: ', t.toString("hh:mm: aa"));
        console.log(tf);
        // timestamps.push(tf);

        console.log('\n\n\n\nENTRY:', entry);
        var n = '';
        var nh = '00:00:00';


        // return mysqlConn.query('INSERT INTO timesheets VALUES(\'' + tf +'\', \'' + entry.employee +'\', \'' + entry.UniqueID +'\');', function(err,rows){
        return mysqlConn.query('INSERT INTO rent VALUES(\'' + entry.Property +'\', \'' + entry.Tenant +'\', ' +
        '\'' + entry.formid +'\', \'' + entry.d +'\',' +
        '\'' + entry.ts +'\', \'' + n +'\',' +
        '\'' + n +'\', \'' + entry.employee +'\',' +
        '\'' + entry.cost_code +'\', \'' + entry.trade +'\',' +
        '\'' + entry.timein +'\', \'' + n +'\',' +
        '\'' + nh +'\', \'' + tt +'\',' +
        '\'' + entry.teamsheet +'\', \'' + no +'\',' +
        '\'' + n +'\', \'' + n +'\''
        +
        ');', function(err,rows){
            arr = rows;
            console.log('Result: ', rows);
            console.log('Error: ', err);

            return mysqlConn.end(function(err){
              if(err) return console.log(err);
              console.log('\tDatabase DISCONNECTED!');
              var t = new Date();
              console.log('\t TIME: ', t.toString("hh:mm: tt"));
              console.log('\n\n\n');
              callback(rows);
              //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
            });
        });


        // return mysqlConn.query('INSERT INTO timesheets2 VALUES(\'' + tf +'\', \'' + entry.employee +'\', \'' + entry.UniqueID +'\');', function(err, rows) {
        //   arr = rows;
        //   console.log('Result: ', rows);
        //   console.log('Error: ', err);
        //
        //   return mysqlConn.end(function(err){
        //     if(err) return console.log(err);
        //     console.log('\tDatabase DISCONNECTED!');
        //     var t = new Date();
        //     console.log('\t TIME: ', t.toString("hh:mm: tt"));
        //     console.log('\n\n\n');
        //     callback(rows);
        //     //PERFECT --> now udemy, review how to config HEROKU env. variables to stuff?
        //   });
        // });
      }
    })
})
}

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

//--------------------------mySQL-----------------------//
//ESTABLISH proxy
// var establishProxy = function(callback){
//   var socksConn = new SocksConnection(mysql_server_options, socks_options);
//
//   // console.log(socksConn);
//   var mysql_options =  {
//     database: process.env.DB,
//     user: process.env.US,
//     password: process.env.PW,
//     stream: socksConn
//   }
//   callback(mysql_options);
// }

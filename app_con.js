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
var dateformat = require('dateformat');

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
  app.post('/newmonth', function(request, response){
    var body = response.req.body;
    console.log('\n\n\nRESPONSEBODY: ',response.req.body);
    try {
      getProperties('rent', function(list){
        console.log('List of Properties', list);
        var t = 0;
        for(t = 0; t < list.length; t++){
          addRentRow(list[t], function(returned){
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
        }
      });
    } catch (e) {
      console.log('\n\n\ngetProperties Function threw an Error: ', e);
    }
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
var getProperties = function(param, callback){
  var propertyList = [];

  establishProxy(function(mysql_options){
    try {
      var getPropertiesQueryConnection = mysql2.createConnection(mysql_options);

      getPropertiesQueryConnection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'ETIMEDOUT') { // Connection to the MySQL server is usually
          console.log('Error with getProperties Query Connection\n');
          console.log('Param: ', param);
          console.log('Callback: ', callback);
          // getProperties(param, callback);             // lost due to either server restart, or a
        }else {                                      // connnection idle timeout (the wait_timeout
          return err;                                  // server variable configures this)
        }
      });
      getPropertiesQueryConnection.query(
        // 'SELECT p.Property, p.Tenant, p.pay_period, r.pay_period FROM property p JOIN rent r ON (r.pay_period = \'' + dateformat("mmm, yyyy") + '\' AND r.Property = p.Property AND CONCAT(p.Property, \'-\', p.pay_period)= CONCAT(r.Property, \'-\', r.pay_period))',
        'SELECT DISTINCT(Property), Tenant, pay_period FROM property;',
        function(err,rows){
      // getPropertiesQueryConnection.query('SELECT Property, Tenant, pay_period FROM property;', function(err,rows){
          arr = rows;
          console.log('Result: ', rows);
          console.log('Error: ', err);

          var xy = 0;
          for(xy=0;xy< rows.length; xy++){
            // if(!rows[xy].pay_period){
              console.log(rows[xy].Property);
              rows[xy].pay_period = dateformat("mmm, yyyy");

              propertyList.push(rows[xy]);
            // }
          }
          // getPropertiesQueryConnection.close();
          callback(propertyList);
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
    } catch (e) {
      console.log(e);
    }
  });
}
var addRentRow = function(entry, callback){
  var array = [];
  console.log('\n\nADDING RENT ROW:\n\n', entry);
  // entry = JSON.stringify(JSON.parse(entry));
  // entry = JSON.stringify(entry, undefined, 2);

  // console.log('JSON STRINGIFY: \n', entry);
  console.log('Property    ', entry.Property);
  var payload = entry;

  console.log('\n\n Entry : ', payload.Property);

  var obj = {
    Property: payload.Property,
    Tenant: payload.Tenant,
    pay_period: payload.pay_period,
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
    // UniqueID: generateID(8),
    UniqueID: payload.Property + '-' + payload.pay_period,
    payment_file: ''
  }


  establishProxy(function(mysql_options){
    try {
      var connection = mysql2.createConnection(mysql_options);

      connection.on('error', function(err) {
        console.log('db error', err);
        console.log('db error code: ', err.code);
        if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT') { // Connection to the MySQL server is usually
          console.log('Error with getProperties Query Connection\n', err.code);
          console.log('Entry: ', entry)
          console.log('Callback: ', callback);
          addRentRow(entry, callback);                // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
          return err;                                  // server variable configures this ADDRENTROW)
        }
      });
      connection.query('INSERT INTO rent(Property, Tenant, UniqueID, pay_period) VALUES(\'' + obj.Property +'\', \'' + obj.Tenant +'\', \'' +
      obj.UniqueID + '\', \''+ obj.pay_period +'\');', function(err,rows){
          arr = rows;

          if(err){
            console.log('Error: ', err.code);
          }else{
            console.log('Result: ', rows);
          }

          // connection.close();
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
    } catch (e) {
      console.log('\n\naddRENTALROW ERROR: ', e);
    }
  });
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

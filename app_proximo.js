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

var mysql2 = require('mysql2');
var url = require('url');
// var array = [];

var mysql_server_options = {
  host: process.env.HOST,
  // port: process.env.PT,
  database: process.env.DB,
  user: process.env.US,
  password: process.env.PW
};
const connection = mysql2.createConnection(mysql_server_options);

//Start Server
var serv = app.listen(port, function(){
  console.log('App listening on port %s', serv.address().port);
  console.log('Press Ctrl+C to quit');


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
    // res.set('Accept', '')
    response.set('Content-Type', 'application/json');
    response.send(response.req.body);

  });
  app.get('/records', function(err, res){
    var request = require('request');

    res.status(200).send(`${records}`);
  });

/////////////////////SEND a webhook -- >< Entire Table?? Offer export
  app.get('/', function(err, res){
    console.log('INCOMING REQUEST\n\n');

      testQuery('rent', function(returned){
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
      return res.status(200).send(`sdfsdfjldsf`);
  });
});

//--------------------------mySQL-----------------------//

//FUNCTION ----> Run an INSERT STATEMNET/DATABASE READ
var testQuery = function(param, callback){
  var array = [];
  connection.query('SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = \'' + param + '\';', function(er, res){
    var x = 0;
    if(er){
      console.log(er);
    }
    var name_type = [];
    for(x = 0; x < res.length; x++){
      array.push(res[x].COLUMN_NAME);
      name_type.push({
        'col_name': res[x].COLUMN_NAME,
        'col_type': res[x].COLUMN_TYPE
      });
    }
    console.log(`\n\n\n\nFetching Fields for TABLE: `, param);
    console.log(`\t\t${param.toUpperCase()} --> DONE`);
    console.log(`\t\t${res.length} Fields added`);
    var filename = param + '_STRUCTURE.csv';
    // var csv = json2csv({data: name_type, fields: ['col_name', 'col_type']});
    // fs.writeFile(filename, csv, function(err){
    //   if(err) throw err;
    //   console.log('File Saved: ', filename);
    // });
    // console.log(`\n\nFIELDS for ${param}`, array);
    // console.log(array);
    callback(array);
  });
}

var addRentRow = function(entry, callback){
  var array = [];
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
}

var generateID = function (len) {
  var crypto = require('crypto');
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}

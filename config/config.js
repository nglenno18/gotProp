var env = process.env.NODE_ENV || 'development';
console.log('ENVIRONMENT: ', env);

if(env == 'development' || env == 'test' || env == 'test '){
  var config = require('./config.json');
  var envConfig = config[env];

  console.log(Object.keys(envConfig));
  Object.keys(envConfig).forEach(function(key){
    process.env[key] = envConfig[key];
  });
}

console.log('Config.js complete');

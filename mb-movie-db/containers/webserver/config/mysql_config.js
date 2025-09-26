

const env = process.env.NODE_ENV;

var mysql_config = require(__dirname + '/../config/config.js')[env];
mysql_config.username = process.env.DB_USER;
mysql_config.password = process.env.DB_PASSWORD;
mysql_config.database = process.env.DB_NAME;
mysql_config.host = process.env.DB_HOST;
mysql_config.port = process.env.DB_PORT;

console.log("Sequelize mysql_config: ", mysql_config);

module.exports = mysql_config;

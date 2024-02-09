const mysql2 = require("mysql2");


const connection = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "myntra",
    port: 3306
  }, console.log("Database Connected"));

  module.exports = connection;
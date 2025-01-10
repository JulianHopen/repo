const mysql = require("mysql2/promise");

async function createConnection() {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Subscribe91",
    database: "login",
  });
}

module.exports = { createConnection };

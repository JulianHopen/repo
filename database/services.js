const { createConnection } = require("./database");

async function addUser(email, password) {
  const connection = await createConnection();
  connection.connect();

  const query = "INSERT INTO user (email, password) VALUES (?,?)";
  connection.execute(query, [email, password]);

  connection.end();
}

module.exports = { addUser };

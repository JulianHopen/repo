const bcrypt = require("bcrypt");
const saltRounds = 10;
const { createConnection } = require("./database");

async function addUser(email, password) {
  const connection = await createConnection();
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  connection.connect();

  const query = "INSERT INTO user (email, password) VALUES (?,?)";
  connection.execute(query, [email, hashedPassword]);

  connection.end();
}

module.exports = { addUser };

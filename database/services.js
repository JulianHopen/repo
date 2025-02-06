const bcrypt = require("bcrypt");
const saltRounds = 10;
const { createConnection } = require("./database");

async function addUser(email, password) {
  const connection = await createConnection();

  connection.connect();

  const FindUserQuery = "SELECT * FROM user WHERE email = ?;";
  const [rows] = await connection.execute(FindUserQuery, [email]);
  const user = await rows[0];

  if (user) {
    return false;
  }
  const addUserQuery = "INSERT INTO user (email, password) VALUES (?,?)";
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  connection.execute(addUserQuery, [email, hashedPassword]);

  connection.end();
  return true;
}

async function authenticateUser(email, password) {
  const connection = await createConnection();

  connection.connect();
  const query = "SELECT * FROM user WHERE email = ?";
  const [rows] = await connection.execute(query, [email]);
  const user = await rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (match) {
    return { success: true, email: user.email, value: user.value };
  }
  connection.end();
}

async function deleteUser(email) {
  const connection = await createConnection();

  connection.connect();
  const deleteUserQuery = "DELETE FROM user WHERE email = ?";
  connection.execute(deleteUserQuery, [email]);

  connection.end();
}

module.exports = { addUser, authenticateUser, deleteUser };

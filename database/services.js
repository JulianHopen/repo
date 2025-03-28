const bcrypt = require("bcrypt");
const saltRounds = 10;
const { createConnection } = require("./database");

async function allData() {
  const connection = await createConnection();

  connection.connect();

  const query = "SELECT * FROM `login`.`user`";
  const [rows] = await connection.execute(query);

  return rows;
}

async function allTickets() {
  const connection = await createConnection();

  connection.connect();

  const query = "SELECT * FROM `login`.`user_request`";
  const [rows] = await connection.execute(query);

  return rows;
}

async function addUser(email, password) {
  const connection = await createConnection();

  connection.connect();

  const FindUserQuery = "SELECT * FROM user WHERE email = ?";
  const [rows] = await connection.execute(FindUserQuery, [email]);
  const user = await rows[0];

  if (user) {
    return false;
  }

  const DefaultuserLevel = "user";

  const addUserQuery =
    "INSERT INTO user (email, password, user_level) VALUES (?,?,?)";
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
  connection.execute(addUserQuery, [email, hashedPassword, DefaultuserLevel]);

  connection.end();
  return true;
}

async function authenticateUser(email, password) {
  const connection = await createConnection();

  connection.connect();
  const query = "SELECT * FROM user WHERE email = ?";
  const [rows] = await connection.execute(query, [email]);
  const user = await rows[0];

  if (rows.length === 0) {
    connection.end();
    return false;
  }
  const match = await bcrypt.compare(password, user.password);
  // console.log(user);
  if (match) {
    return {
      success: true,
      email: user.email,
      value: user.value,
      userLevel: user.user_level,
      userRef: user.user_ref,
    };
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

async function userRequest(supportTicket, userRef, email) {
  const connection = await createConnection();

  connection.connect();
  const addUserQuery = "INSERT INTO user_request (text, email) VALUES (?, ?)";
  connection.execute(addUserQuery, [supportTicket, email]);

  connection.end();
  return true;
}

module.exports = {
  addUser,
  authenticateUser,
  deleteUser,
  allData,
  userRequest,
  allTickets,
};

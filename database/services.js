const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { createConnection } = require("./database");
const { isAdmin } = require("../middleware/authMiddleware");

const saltRounds = 10;

async function allData() {
  const connection = await createConnection();

  connection.connect();

  const query = "SELECT * FROM `login`.`user`";
  const [rows] = await connection.execute(query);

  return rows;
}

async function SearchByEmail(email) {
  const connection = await createConnection();
  const query = "SELECT * FROM user WHERE email = ?";
  const [rows] = await connection.execute(query, [email]);

  return {
    success: true,
    rows,
    search: email,
  };
}

async function displayRequest(requestedEmail) {
  const connection = await createConnection();

  connection.connect();
  const query = "SELECT * FROM `login`.`user_request` WHERE email = ?";
  const [rows] = await connection.execute(query, [requestedEmail]);
  connection.end();
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

  const randomBytes = crypto.randomBytes(32);
  const md5Hash = crypto.createHash("md5").update(randomBytes).digest("hex");
  connection.connect();

  const FindUserQuery = "SELECT * FROM user WHERE email = ?";
  const [rows] = await connection.execute(FindUserQuery, [email]);
  const user = await rows[0];

  if (user) {
    return false;
  }
  const hashedPassword = await bcrypt.hashSync(password, saltRounds);
  const userRef = md5Hash;
  const DefaultuserLevel = "user";

  const addUserQuery =
    "INSERT INTO user (email, password, user_ref, user_level) VALUES (?,?,?,?)";
  connection.execute(addUserQuery, [
    email,
    hashedPassword,
    userRef,
    DefaultuserLevel,
  ]);

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

async function removeUserByRef(userRef) {
  const connection = await createConnection();

  const deleteBistandQuary = "DELETE FROM user_request WHERE user_ref = ?";
  await connection.execute(deleteBistandQuary, [userRef]);

  const deleteUserQuary = "DELETE FROM user WHERE user_ref = ?";
  await connection.execute(deleteUserQuary, [userRef]);

  await connection.end();
  return {
    success: true,
  };
}

async function userRequest(supportTicket, userRef, email) {
  const connection = await createConnection();

  connection.connect();

  const userLevelQuary =
    "UPDATE USER SET user_level = 'request' WHERE email = ?";
  await connection.execute(userLevelQuary, [email]);

  const addUserQuery =
    "INSERT INTO user_request (text, email, user_ref) VALUES (?, ?, ?)";
  await connection.execute(addUserQuery, [supportTicket, email, userRef]);

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
  displayRequest,
  removeUserByRef,
  SearchByEmail,
};

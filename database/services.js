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

async function userData(email) {
  const connection = await createConnection();

  connection.connect();

  const query = "SELECT * FROM `login`.`user_data` WHERE email = ?";
  const [rows] = await connection.execute(query, [email]);

  return rows;
}

async function searchByEmail(email) {
  const connection = await createConnection();

  connection.connect();

  const query = "SELECT * FROM user_request WHERE email = ?";
  const [rows] = await connection.execute(query, [email]);

  connection.end();
  return { success: true, rows };
}

async function isUpdated(email) {
  const connection = await createConnection();

  connection.connect();

  const query = "SELECT * FROM `login`.`user_data` WHERE email = ?";
  const [rows] = await connection.execute(query, [email]);
  const user = await rows[0];

  return {
    success: true,
    updated: user.updated,
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

  const userDataQuery =
    "INSERT INTO user_data (user_ref, email) SELECT user_ref, email FROM user";
  await connection.execute(userDataQuery);

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

async function updateUser(firstName, lastName, phoneNumber, address, email) {
  const connection = await createConnection();

  connection.connect();

  const updateData =
    "UPDATE `login`.`user_data` SET `first_name`=?, `last_name`=?, `phone_number`=?, `address`=? WHERE `email` = ?";
  await connection.execute(updateData, [
    firstName,
    lastName,
    phoneNumber,
    address,
    email,
  ]);

  const setUpdate =
    "UPDATE `login`.`user_data` SET updated ='true' WHERE email= ?";
  await connection.execute(setUpdate, [email]);

  const query = "SELECT * FROM `login`.`user_data` WHERE email = ?";
  const [rows] = await connection.execute(query, [email]);
  const user = await rows[0];

  connection.end();
  return {
    success: true,
    updated: user.updated,
  };
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

  const deleteSupportQuary = "DELETE FROM user_request WHERE user_ref = ?";
  await connection.execute(deleteSupportQuary, [userRef]);

  const deleteUserData = "DELETE FROM user_data WHERE user_ref = ?";
  await connection.execute(deleteUserData, [userRef]);

  const deleteArchiveQuery = "DELETE FROM archived WHERE user_ref = ?";
  await connection.execute(deleteArchiveQuery, [userRef]);

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

async function archiveRequest(id) {
  const connection = await createConnection();

  const userArchiveQuery =
    "INSERT INTO archived (text, user_ref, email) SELECT text, user_ref, email FROM user_request WHERE id = ?";
  await connection.execute(userArchiveQuery, [id]);

  const deleteUserQuery = "DELETE FROM user_request WHERE id = ?";
  await connection.execute(deleteUserQuery, [id]);

  connection.end();
  return true;
}

// async function insertUserdata(
//   email,
//   userRef,
//   firstName,
//   lastName,
//   phoneNumber,
//   address
// ) {
//   const connection = await createConnection();

//   connection.connect();
//   const insertedData = "true";

//   const insertUserData =
//     "INSERT INTO user_data (email, user_ref, first_name, last_name, phone_number, address, inserted) VALUES (?,?,?,?,?,?,?)";
//   await connection.execute(insertUserData, [
//     email,
//     userRef,
//     firstName,
//     lastName,
//     phoneNumber,
//     address,
//     insertedData,
//   ]);

//   connection.end();
//   return true;
// }

// async function archiveRequest(id) {
//   const connection = await createConnection();

//   const userTextQuary = "UPDATE user_request SET archive = text WHERE id = ?";
//   await connection.execute(userTextQuary, [id]);

//   connection.end();
//   return true;
// }

module.exports = {
  addUser,
  authenticateUser,
  deleteUser,
  allData,
  userRequest,
  allTickets,
  displayRequest,
  removeUserByRef,
  archiveRequest,
  updateUser,
  userData,
  isUpdated,
  searchByEmail,
};

const { addUser } = require("./database/services");

const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  addUser(email, password);

  return res.redirect("/signup");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

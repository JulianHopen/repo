const { addUser, authenticateUser } = require("./database/services");

const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const validator = require("validator");
const session = require("express-session");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "shhhh, very secret",
  })
);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const strongPassword = validator.isStrongPassword(password, {
    minLength: 3,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  });

  if (!strongPassword) {
    console.log(validator.isStrongPassword(password));
    return res.redirect("/signup");
  }

  const emailChecker = await addUser(email, password);

  if (!emailChecker) {
    console.log("Email is already in use");
    return res.redirect("/signup");
  }

  return res.redirect("/login");
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const auth = await authenticateUser(email, password);

  if (auth) {
    req.session.email = auth.email;
    return res.redirect("/dashboard");
  }
  return res.redirect("/login");
});

function isAuthenticated(req, res, next) {
  if (req.session.email) {
    next();
  } else {
    req.session.error = "Access denied!";
    res.redirect("/login");
  }
}

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", {
    email: req.session.email,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

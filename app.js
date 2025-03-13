const {
  addUser,
  authenticateUser,
  deleteUser,
  allData,
} = require("./database/services");

const { isAuthenticated } = require("./middleware/authenticate");

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const validator = require("validator");
const session = require("express-session");

app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "shhhh, very secret",
  })
);

app.get("/", (req, res) => {
  const locals = {
    title: "Homepage",
    userLevel: req.session.userLevel,
  };
  res.render("index", locals);
});

app.get("/signup", (req, res) => {
  const locals = {
    title: "Signup",
    userLevel: req.session.userLevel,
  };
  res.render("signup", locals);
});

app.get("/login", (req, res) => {
  const locals = {
    title: "Login",
    userLevel: req.session.userLevel,
  };
  res.render("login", locals);
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
    req.session.value = auth.value;
    req.session.userLevel = auth.userLevel;

    if (req.session.userLevel === 1) {
      return res.redirect("/dashboard");
    }
    if (req.session.userLevel === 2) {
      return res.redirect("/dashboard-admin");
    }
    // console.log(req.session.userLevel);
  }
  return res.redirect("/login");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", {
    title: "Dashboard",
    email: req.session.email,
    value: req.session.value,
    userLevel: req.session.userLevel,
  });
});

app.get("/dashboard-admin", isAuthenticated, async (req, res) => {
  const retrieveData = await allData();
  res.render("admindash", {
    title: "Admindash",
    display: retrieveData,
    email: req.session.email,
    value: req.session.value,
    userLevel: req.session.userLevel,
  });
});

app.post("/logout", isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.post("/dashboard/delete", isAuthenticated, (req, res) => {
  deleteUser(req.session.email);
  req.session.destroy();
  res.redirect("/login");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const {
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
} = require("./database/services");

const { isAuthenticated, isAdmin } = require("./middleware/authMiddleware");

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
  const { email, password } = req.body;

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
  const { email, password } = req.body;

  const auth = await authenticateUser(email, password);
  if (auth) {
    req.session.email = auth.email;
    req.session.userRef = auth.userRef;
    req.session.userLevel = auth.userLevel;

    if (req.session.userLevel === "user") {
      return res.redirect("/dashboard");
    }
    if (req.session.userLevel === "request") {
      return res.redirect("/dashboard");
    }
    if (req.session.userLevel === "admin") {
      return res.redirect("/dashboard-admin");
    }
    // console.log(req.session.userLevel);
  }
  return res.redirect("/login");
});

app.get("/dashboard", isAuthenticated, async (req, res) => {
  const request = await displayRequest(req.session.email);
  res.render("dashboard", {
    title: "Dashboard",
    display: request,
    email: req.session.email,
    userRef: req.session.userRef,
    userLevel: req.session.userLevel,
  });
});

app.get("/dashboard-admin", isAuthenticated, isAdmin, async (req, res) => {
  const retrieveData = await allData();
  res.render("admindash", {
    title: "Admin dashboard",
    email: req.session.email,
    userRef: req.session.userRef,
    userLevel: req.session.userLevel,
    display: retrieveData,
  });
});

app.get("/search", isAuthenticated, isAdmin, async (req, res) => {
  const email = req.params;
  // if (email) {
  //   const filter = await searchByEmail(email);
  //   console.log(filter);
  //   req.session.destroy(function () {
  //     req.session.search;
  //   });
  //   return filter;
  // }
  res.render("search", {
    title: "search",
    userLevel: req.session.userLevel,
  });
});

app.post("/search", isAuthenticated, isAdmin, async (req, res) => {
  let sessionSearch = req.body.search;
  sessionSearch = req.params;
  console.log(req.params);
  // if (sessionSearch) {
  //   req.session.search = sessionSearch;
  // }
  res.redirect("/search");
});

app.post("/logout", isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.post("/dashboard/delete", isAuthenticated, async (req, res) => {
  deleteUser(req.session.email);
  req.session.destroy();
  res.redirect("/login");
});

app.post(
  "/dashboard/delete/:userRef",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    const { userRef } = req.params;

    await removeUserByRef(userRef);
    res.redirect("/dashboard-admin");
  }
);

app.get("/userdata", isAuthenticated, async (req, res) => {
  const { email } = req.session;
  const data = await userData(email);
  const updated = await isUpdated(email);
  if (updated) {
    req.session.updated = updated.updated;
  }

  res.render("userdata", {
    title: "User",
    list: data,
    updated: req.session.updated,
    email: req.session.email,
    userRef: req.session.userRef,
    userLevel: req.session.userLevel,
  });
});

app.post("/userdata", isAuthenticated, async (req, res) => {
  const { firstName, lastName, phoneNumber, address } = req.body;
  const { email } = req.session;
  await updateUser(firstName, lastName, phoneNumber, address, email);
  res.redirect("userdata");
});

app.get("/support", isAuthenticated, (req, res) => {
  res.render("support", {
    title: "Support",
    userLevel: req.session.userLevel,
  });
});
app.post("/support", isAuthenticated, async (req, res) => {
  const supportTicket = req.body.userRequest;
  const { userRef, email } = req.session;
  await userRequest(supportTicket, userRef, email);

  req.session.userLevel = "request";
  res.redirect("/dashboard");
});

app.get("/support-admin", isAuthenticated, isAdmin, async (req, res) => {
  const data = await allTickets();
  res.render("adminsupport", {
    title: "Admin support panel",
    display: data,
    email: req.session.email,
    userRef: req.session.userRef,
    userLevel: req.session.userLevel,
  });
});

app.post("/support-admin", isAuthenticated, isAdmin, async (req, res) => {
  const { email } = req.body;
  console.log(email);
  res.redirect("/support-admin");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post("/support-admin/:id", isAuthenticated, isAdmin, async (req, res) => {
  const { id } = req.params;

  await archiveRequest(id);
  res.redirect("/support-admin");
});

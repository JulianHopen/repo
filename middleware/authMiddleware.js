function isAuthenticated(req, res, next) {
  if (req.session.email) {
    next();
  } else {
    req.session.error = "Access denied!";
    res.redirect("/login");
  }
}

function isAdmin(req, res, next) {
  if (req.session.userLevel === "admin") {
    next();
  } else {
    req.session.error = "Access denied!";
    res.redirect("/login");
  }
}
module.exports = { isAuthenticated, isAdmin };

function requireLogin(req, res, next) {
  if (!req.session.businessId) {
    return res.redirect('/login');
  }
  next();
}

module.exports = { requireLogin };

exports.ensureProviderLoggedIn = (req, res, next) => {
    if (req.session.provider) {
      next();
    } else {
      res.redirect('/login');
    }
  };
  
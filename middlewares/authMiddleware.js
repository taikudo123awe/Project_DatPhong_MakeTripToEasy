exports.ensureCustomerLoggedIn = (req, res, next) => {
  if (req.session && req.session.customer) {
    return next();
  }
  
  req.session.returnTo = req.originalUrl;

  return res.redirect('/customer/login');
};


exports.ensureProviderLoggedIn = (req, res, next) => {
  if (req.session && req.session.provider) {
    return next();
  }
  res.redirect('/provider/login');
};


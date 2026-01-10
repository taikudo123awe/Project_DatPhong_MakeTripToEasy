module.exports = (req, res, next) => {
  res.locals.currentUrl = req.originalUrl;
  next();
};

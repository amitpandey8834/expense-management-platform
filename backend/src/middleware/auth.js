const jwt = require("jsonwebtoken");

const config = require("../config/env");
const AppError = require("../utils/AppError");

const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authorization.split(" ")[ 1 ];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = decoded;

    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

module.exports = authenticate;
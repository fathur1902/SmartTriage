const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

const authenticateToken = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Token tidak ditemukan" });
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ message: "Token tidak valid" });
      if (!allowedRoles.includes(user.role))
        return res.status(403).json({ message: "Akses ditolak" });
      req.user = user;
      next();
    });
  };
};

module.exports = { authenticateToken };

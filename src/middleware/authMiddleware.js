const jwt = require("jsonwebtoken");
const AppError = require("@/lib/appError");

const SECRET_KEY = process.env.JWT_SECRET_KEY || "default";

function verifyToken(req) {
  const cookie = req.headers.get("cookie");
  if(!cookie) {
    throw new AppError("Sessão expirada", 401);
  }

  const token = cookie.split("=")[1];
  if(!token) {
    throw new AppError("Sessão expirada", 401);
  }

  try {
    return jwt.verify(token, SECRET_KEY);
  } catch {
    throw new AppError("Sessão expirada", 401);
  }
}

module.exports = {
  verifyToken
};
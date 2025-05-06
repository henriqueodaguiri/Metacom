const AppError = require("@/lib/appError");

function verifyRole(tokenInfo, role) {
  if(tokenInfo.role !== role) {
    throw new AppError("Não autorizado", 401);
  }
}

module.exports = {
  verifyRole
};
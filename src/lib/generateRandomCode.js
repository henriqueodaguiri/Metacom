const crypto = require("crypto");

function generateRandomCode(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.randomBytes(length))
      .map(byte => characters[byte % characters.length])
      .join("");
}

module.exports = generateRandomCode;
const createResponse = require("./responseHelper");

function handleError(error) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  return createResponse({ body: { message }, status: statusCode });
}

module.exports = handleError;
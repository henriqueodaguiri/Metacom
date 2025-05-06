const authService = require("@/services/authService");
const userService = require("@/services/userService");
const createResponse = require("@/lib/responseHelper");
const EXPIRES_IN = process.env.EXPIRES_IN || "3600";

async function login(req) {
  const { email, password } = await req.json();
  const { user, token } = await authService.authenticate(email, password);
  const response = createResponse({ body: { user } }); 
  response.headers.append("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=${EXPIRES_IN}`);

  return response;
};

async function fetchAuthUser(userId) {
  const user = await userService.getUserById(userId);

  return createResponse({ body: { user }});
};

function logout() {
  const response = createResponse({ body: { message: "Logged out" } }); 
  response.headers.append("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0");

  return response;
}

module.exports = {
  login,
  logout,
  fetchAuthUser
};
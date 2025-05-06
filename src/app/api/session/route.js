import handleError from "@/lib/errorHandler";
const authController = require("@/controllers/authController");
const { verifyToken } = require("@/middleware/authMiddleware");

export async function POST(req) {
  try {
    return await authController.login(req);
  } catch(error) {
    return handleError(error);
  }
}

export async function GET(req) {
  try {
    const { userId } = verifyToken(req);
    return await authController.fetchAuthUser(userId);
  } catch(error) {
    return handleError(error);
  }
}

export async function DELETE(req) {
  return authController.logout(req);
}
import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const userController = require("@/controllers/userController");

export async function GET(req) {
  try {
    const { userId } = verifyToken(req);
    return await userController.getStudentUndoneTexts(userId);
  } catch(error) {
    return handleError(error);
  }
}
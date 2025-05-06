import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const userController = require("@/controllers/userController");

export async function PATCH(req) {
  try {
    const { userId } =  verifyToken(req);
    return await userController.updateAvatar(req, userId);
  } catch(error) {
    return handleError(error);
  }
}

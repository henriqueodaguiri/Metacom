import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const userController = require("@/controllers/userController");

export async function POST(req) {
  try {
    return await userController.create(req);
  } catch(error) {
    return handleError(error);
  }
}

export async function PUT(req) {
  try {
    const { userId } =  verifyToken(req);
    return await userController.update(req, userId);
  } catch(error) {
    return handleError(error);
  }
}
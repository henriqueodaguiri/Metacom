import handleError from "@/lib/errorHandler";
import roles from "@/lib/roles";
import { verifyToken } from "@/middleware/authMiddleware";
import { verifyRole } from "@/middleware/roleMiddleware";
const classController = require("@/controllers/classController");

export async function POST(req) {
  try {
    const tokenInfo =  verifyToken(req);
    verifyRole(tokenInfo, roles.STUDENT);
    return await classController.join(req, tokenInfo.userId);
  } catch(error) {
    return handleError(error);
  }
}
import handleError from "@/lib/errorHandler";
import roles from "@/lib/roles";
import { verifyToken } from "@/middleware/authMiddleware";
import { verifyRole } from "@/middleware/roleMiddleware";
const classController = require("@/controllers/classController");

export async function GET(req) {
  try {
    const tokenInfo =  verifyToken(req);
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    
    return await classController.index(req, name, tokenInfo.userId, tokenInfo.role);
  } catch(error) {
    return handleError(error);
  }
}

export async function POST(req) {
  try {
    const tokenInfo =  verifyToken(req);
    verifyRole(tokenInfo, roles.TEACHER);
    return await classController.create(req, tokenInfo.userId);
  } catch(error) {
    return handleError(error);
  }
}
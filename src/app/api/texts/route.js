import handleError from "@/lib/errorHandler";
import roles from "@/lib/roles";
import { verifyToken } from "@/middleware/authMiddleware";
import { verifyRole } from "@/middleware/roleMiddleware";
const textController = require("@/controllers/textController");

export async function GET(req) {
  try {
    verifyToken(req);
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    
    return await textController.index(req, name);
  } catch(error) {
    return handleError(error);
  }
}

export async function POST(req) {
  try {
    const tokenInfo =  verifyToken(req);
    verifyRole(tokenInfo, roles.TEACHER);
    return await textController.create(req);
  } catch(error) {
    return handleError(error);
  }
}

export async function PUT(req) {
  try {
    const tokenInfo =  verifyToken(req);
    verifyRole(tokenInfo, roles.TEACHER);
    return await textController.update(req);
  } catch(error) {
    return handleError(error);
  }
}
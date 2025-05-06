import handleError from "@/lib/errorHandler";
import roles from "@/lib/roles";
import { verifyToken } from "@/middleware/authMiddleware";
import { verifyRole } from "@/middleware/roleMiddleware";
const classController = require("@/controllers/classController");

export async function DELETE(req, { params }) {
  try {
    const tokenInfo = verifyToken(req);
    verifyRole(tokenInfo, roles.TEACHER);
    const classId = Number(params.classId);
    const textId = Number(params.textId);

    return await classController.removeText(classId, textId, tokenInfo.userId);
  } catch(error) {
    return handleError(error);
  }
}

export async function POST(req, { params }) {
  try {
    const tokenInfo = verifyToken(req);
    verifyRole(tokenInfo, roles.TEACHER);
    const classId = Number(params.classId);
    const textId = Number(params.textId);

    return await classController.addText(classId, textId, tokenInfo.userId);
  } catch(error) {
    return handleError(error);
  }
}
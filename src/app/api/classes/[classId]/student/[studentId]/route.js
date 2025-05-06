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
    const studentId = Number(params.studentId);

    return await classController.removeStudent(classId, studentId, tokenInfo.userId);
  } catch(error) {
    return handleError(error);
  }
}
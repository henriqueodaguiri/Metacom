import handleError from "@/lib/errorHandler";
import roles from "@/lib/roles";
import { verifyToken } from "@/middleware/authMiddleware";
import { verifyRole } from "@/middleware/roleMiddleware";
const classTextController = require("@/controllers/classTextController");

export async function GET(req, { params }) {
  try {
    const { userId } = verifyToken(req);
    // Permite acesso para professor e aluno
    verifyRole([roles.STUDENT, roles.TEACHER]);
    const classId = Number(params.classId);
    const textId = Number(params.textId);
    // Novo: permite passar studentId via query para o professor
    const url = new URL(req.url, 'http://localhost');
    const studentId = url.searchParams.get('studentId') ? Number(url.searchParams.get('studentId')) : userId;
    return await classTextController.show(classId, textId, studentId);
  } catch(error) {
    return handleError(error);
  }
}

export async function POST(req, { params }) {
  try {
    const { userId } = verifyToken(req);
    verifyRole(roles.STUDENT);
    const classId = Number(params.classId);
    const textId = Number(params.textId);
    return await classTextController.createAnswer(classId, textId, userId, req);
  } catch(error) {
    return handleError(error);
  }
}

import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const prisma = require("@/lib/prisma");

// GET /api/dashboard/teacher-classes
export async function GET(req) {
  try {
    const tokenInfo = verifyToken(req);
    // Busca todas as turmas do professor
    const classes = await prisma.class.findMany({
      where: { teacherId: tokenInfo.userId, active: true },
      orderBy: { name: "asc" },
    });
    if (!classes.length) return Response.json({ classes: [] });

    // Para cada turma, busca os alunos e a média (grade) de cada um
    const classIds = classes.map(cls => cls.id);
    const classUsers = await prisma.classUser.findMany({
      where: { classId: { in: classIds } },
      include: { student: true },
    });
    // Agrupa por turma
    const classesWithStudents = classes.map(cls => {
      const students = classUsers
        .filter(cu => cu.classId === cls.id)
        .map(cu => ({
          id: cu.student.id,
          name: cu.student.name,
          avg: cu.grade !== undefined && cu.grade !== null ? Number(cu.grade) : null,
        }));
      return {
        id: cls.id,
        className: cls.name,
        students,
      };
    });
    return Response.json({ classes: classesWithStudents });
  } catch (error) {
    return handleError(error);
  }
}

import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const prisma = require("@/lib/prisma");

export async function GET(req, { params }) {
  try {
    const tokenInfo = verifyToken(req);
    const classId = Number(params.classId);
    if (!classId) {
      return Response.json({ students: [] }, { status: 400 });
    }
    // Busca todos os alunos da turma
    const classUsers = await prisma.classUser.findMany({
      where: { classId },
      include: { student: true }
    });
    const studentIds = classUsers.map(cu => cu.studentId);
    if (studentIds.length === 0) {
      return Response.json({ students: [] });
    }
    // Busca os resultados de estilos de aprendizagem dos alunos
    const results = await prisma.learningPreferences.findMany({
      where: { userId: { in: studentIds } }
    });
    // Monta a lista de alunos com seus resultados
    const url = new URL(req.url, 'http://localhost');
    const styleIdx = url.searchParams.get('styleIdx');
    let students = classUsers.map(cu => {
      const result = results.find(r => r.userId === cu.studentId);
      return {
        id: cu.student.id,
        name: cu.student.name,
        percentages: result ? result.percentages : Array(4).fill(0)
      };
    });
    if (styleIdx !== null && !isNaN(Number(styleIdx))) {
      const idx = Number(styleIdx);
      students = students.sort((a, b) => {
        const aVal = Number(a.percentages[idx]) || 0;
        const bVal = Number(b.percentages[idx]) || 0;
        return bVal - aVal;
      });
    }
    return Response.json({ students });
  } catch (error) {
    return handleError(error);
  }
}

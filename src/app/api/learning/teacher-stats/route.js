import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const prisma = require("@/lib/prisma");

export async function GET(req) {
  try {
    const tokenInfo = verifyToken(req);
    // Busca o professor e suas turmas (ClassUser -> class)
    const teacher = await prisma.user.findFirst({
      where: { id: tokenInfo.userId, role: "TEACHER" },
      include: {
        classUser: { // ClassUser[]
          include: {
            class: true // pega o objeto turma
          }
        }
      }
    });
    if (!teacher) return Response.json({ studentsAvg: Array(8).fill(0), classes: [] });

    // Busca IDs das turmas do professor
    const classIds = teacher.classUser.map(cu => cu.classId);
    if (classIds.length === 0) return Response.json({ studentsAvg: Array(8).fill(0), classes: [] });

    // Busca todos os alunos dessas turmas
    const classUsers = await prisma.classUser.findMany({
      where: { classId: { in: classIds } },
      include: { student: true }
    });
    const studentIds = [...new Set(classUsers.map(cu => cu.studentId))];
    if (studentIds.length === 0) return Response.json({ studentsAvg: Array(8).fill(0), classes: [] });

    // Busca todos os learningResults desses alunos
    const results = await prisma.learningResult.findMany({
      where: { userId: { in: studentIds } }
    });
    // Calcula média geral
    let studentsAvg = Array(8).fill(0);
    if (results.length > 0) {
      for (const r of results) {
        for (let i = 0; i < 8; i++) studentsAvg[i] += (r.percentages[i] || 0);
      }
      studentsAvg = studentsAvg.map(v => Number((v / results.length).toFixed(2)));
    }

    // Média por turma
    const classes = [];
    for (const cu of teacher.classUser) {
      const classId = cu.classId;
      const turma = cu.class;
      const turmaUsers = classUsers.filter(cu2 => cu2.classId === classId);
      const turmaStudentIds = turmaUsers.map(cu2 => cu2.studentId);
      const turmaResults = results.filter(r => turmaStudentIds.includes(r.userId));
      let avg = Array(8).fill(0);
      if (turmaResults.length > 0) {
        for (const r of turmaResults) {
          for (let i = 0; i < 8; i++) avg[i] += (r.percentages[i] || 0);
        }
        avg = avg.map(v => Number((v / turmaResults.length).toFixed(2)));
      }
      classes.push({ className: turma?.name || "Turma", avg });
    }
    return Response.json({ studentsAvg, classes });
  } catch (error) {
    console.error("Erro ao buscar estatísticas do professor:", error, error?.message, error?.stack);
    return handleError(error);
  }
}

import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const prisma = require("@/lib/prisma");

export async function GET(req) {
  try {
    const tokenInfo = verifyToken(req);
    // Busca as turmas onde o professor é teacherId E estão ativas
    const classes = await prisma.class.findMany({
      where: { teacherId: tokenInfo.userId, active: true },
    });
    const classIds = classes.map(cls => cls.id);
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
    let studentsAvg = Array(8).fill(0);
    if (results.length > 0) {
      for (const r of results) {
        for (let i = 0; i < 8; i++) studentsAvg[i] += (r.percentages[i] || 0);
      }
      studentsAvg = studentsAvg.map(v => Number((v / results.length).toFixed(2)));
    }

    // Média por turma
    const classesStats = [];
    for (const turma of classes) {
      const classId = turma.id;
      const turmaUsers = classUsers.filter(cu2 => cu2.classId === classId);
      const turmaStudentIds = turmaUsers.map(cu2 => cu2.studentId);
      const turmaStudentNames = turmaUsers.map(cu2 => cu2.student.name); // <-- add names
      const turmaResults = results.filter(r => turmaStudentIds.includes(r.userId));
      let avg = Array(8).fill(0);
      if (turmaResults.length > 0) {
        for (const r of turmaResults) {
          for (let i = 0; i < 8; i++) avg[i] += (r.percentages[i] || 0);
        }
        avg = avg.map(v => Number((v / turmaResults.length).toFixed(2)));
      }
      classesStats.push({ id: turma.id, className: turma?.name || "Turma", avg, students: turmaStudentNames });
    }
    // Monta lista global de alunos para scatter chart geral (sem duplicidade)
    const studentMap = {};
    classUsers.forEach(cu => {
      const result = results.find(r => r.userId === cu.studentId);
      if (!studentMap[cu.student.id]) {
        studentMap[cu.student.id] = {
          id: cu.student.id,
          name: cu.student.name,
          classNames: [classes.find(cls => cls.id === cu.classId)?.name || ''],
          percentages: result ? result.percentages : Array(8).fill(0)
        };
      } else {
        // Adiciona turma se não estiver na lista
        const turmaNome = classes.find(cls => cls.id === cu.classId)?.name || '';
        if (!studentMap[cu.student.id].classNames.includes(turmaNome)) {
          studentMap[cu.student.id].classNames.push(turmaNome);
        }
      }
    });
    const allStudents = Object.values(studentMap).map(s => ({
      ...s,
      className: s.classNames.join(', ')
    }));
    return Response.json({ studentsAvg, classes: classesStats, allStudents });
  } catch (error) {
    console.error("Erro ao buscar estatísticas do professor:", error, error?.message, error?.stack);
    return handleError(error);
  }
}

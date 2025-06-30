import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const prisma = require("@/lib/prisma");

// GET /api/dashboard/teacher-students-summary
export async function GET(req) {
  try {
    const tokenInfo = verifyToken(req);
    // Busca todas as turmas do professor
    const classes = await prisma.class.findMany({
      where: { teacherId: tokenInfo.userId, active: true },
      select: { id: true, name: true }
    });
    const classIds = classes.map(cls => cls.id);
    if (!classIds.length) return Response.json({ students: [] });

    // Busca todos os alunos dessas turmas
    const classUsers = await prisma.classUser.findMany({
      where: { classId: { in: classIds } },
      include: { student: true }
    });
    // Agrupa alunos únicos
    const studentsMap = {};
    classUsers.forEach(cu => {
      if (!studentsMap[cu.studentId]) {
        studentsMap[cu.studentId] = {
          id: cu.student.id,
          name: cu.student.name,
          classIds: [],
          classNames: [],
        };
      }
      studentsMap[cu.studentId].classIds.push(cu.classId);
      const className = classes.find(c => c.id === cu.classId)?.name;
      if (className) studentsMap[cu.studentId].classNames.push(className);
    });
    const studentIds = Object.keys(studentsMap).map(Number);

    // Busca inteligências múltiplas e estilos de aprendizagem
    const learningResults = await prisma.learningResult.findMany({
      where: { userId: { in: studentIds } }
    });
    const learningPrefs = await prisma.learningPreferences.findMany({
      where: { userId: { in: studentIds } }
    });

    // Busca todas as performances dos alunos
    const performances = await prisma.performance.findMany({
      where: { studentId: { in: studentIds }, classId: { in: classIds } }
    });

    // Busca todos os textos atribuídos a cada turma (para totalLeituras por aluno)
    const classTextsAll = await prisma.classText.findMany({
      where: { classId: { in: classIds } },
      select: { classId: true, textId: true }
    });

    // Monta resultado final
    const students = Object.values(studentsMap).map(stu => {
      // Inteligência múltipla predominante
      const lr = learningResults.find(lr => lr.userId === stu.id);
      let intelligence = null;
      let intelligenceIdx = null;
      if (lr && Array.isArray(lr.percentages)) {
        intelligence = lr.percentages;
        intelligenceIdx = intelligence.findIndex(v => v === Math.max(...intelligence));
      } else if (lr && typeof lr.percentages === 'object' && lr.percentages !== null) {
        // Caso percentages seja objeto (json)
        const arr = Object.values(lr.percentages).map(Number);
        intelligence = arr;
        intelligenceIdx = arr.findIndex(v => v === Math.max(...arr));
      }
      const intelligenceLabels = [
        'Lógico-matemática', 'Linguística', 'Espacial', 'Corporal',
        'Musical', 'Interpessoal', 'Intrapessoal', 'Naturalista'
      ];
      const intelligencePredominant = intelligenceIdx !== null && intelligenceIdx !== -1 ? intelligenceLabels[intelligenceIdx] : null;

      // Estilo de aprendizagem predominante
      const lp = learningPrefs.find(lp => lp.userId === stu.id);
      let learning = null;
      let learningIdx = null;
      if (lp && Array.isArray(lp.percentages)) {
        learning = lp.percentages;
        learningIdx = learning.findIndex(v => v === Math.max(...learning));
      } else if (lp && typeof lp.percentages === 'object' && lp.percentages !== null) {
        const arr = Object.values(lp.percentages).map(Number);
        learning = arr;
        learningIdx = arr.findIndex(v => v === Math.max(...arr));
      }
      const learningLabels = ['Ativo', 'Reflexivo', 'Teórico', 'Pragmático'];
      const learningPredominant = learningIdx !== null && learningIdx !== -1 ? learningLabels[learningIdx] : null;

      // --- CORREÇÃO: Leituras respondidas e total só das atribuídas ao aluno ---
      // Textos atribuídos ao aluno (das turmas em que ele está)
      let textosAtribuidos = [];
      if (stu.classIds && stu.classIds.length > 0) {
        const classTexts = classTextsAll.filter(ct => stu.classIds.includes(ct.classId));
        textosAtribuidos = [...new Set(classTexts.map(ct => ct.textId))];
      }
      const totalLeituras = textosAtribuidos.length;

      // Leituras respondidas: só conta se respondeu uma leitura atribuída
      const studentPerformances = performances.filter(
        p => p.studentId === stu.id && textosAtribuidos.includes(p.textId)
      );
      // Se houver múltiplas respostas para o mesmo texto, conta só uma por texto
      const leiturasRespondidas = [...new Set(studentPerformances.map(p => p.textId))].length;

      const mediaLeituras = studentPerformances.length > 0
        ? (studentPerformances.reduce((acc, p) => acc + (typeof p.grade === 'number' ? p.grade : 0), 0) / studentPerformances.length).toFixed(2)
        : null;

      return {
        id: stu.id,
        name: stu.name,
        turmas: stu.classNames,
        inteligenciaPredominante: intelligencePredominant,
        estiloPredominante: learningPredominant,
        leiturasRespondidas,
        totalLeituras,
        mediaLeituras
      };
    });
    return Response.json({ students });
  } catch (error) {
    return handleError(error);
  }
}

import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const prisma = require("@/lib/prisma");

// GET /api/dashboard/teacher-texts
export async function GET(req) {
  try {
    const tokenInfo = verifyToken(req);
    // Busca todas as turmas do professor
    const classes = await prisma.class.findMany({
      where: { teacherId: tokenInfo.userId, active: true },
      select: { id: true }
    });
    const classIds = classes.map(cls => cls.id);
    if (!classIds.length) return Response.json({ texts: [] });

    // Busca todos os textos dessas turmas
    const classTexts = await prisma.classText.findMany({
      where: { classId: { in: classIds } },
      include: { text: true }
    });
    const textIds = [...new Set(classTexts.map(ct => ct.textId))];
    if (!textIds.length) return Response.json({ texts: [] });

    // Busca todos os alunos dessas turmas
    const classUsers = await prisma.classUser.findMany({
      where: { classId: { in: classIds } },
      include: { student: true }
    });

    // Busca todas as performances desses textos nessas turmas
    const performances = await prisma.performance.findMany({
      where: { textId: { in: textIds }, classId: { in: classIds } },
    });

    // Busca nomes das turmas para mapear classId -> nome
    const classMap = Object.fromEntries(
      (await prisma.class.findMany({
        where: { id: { in: classIds } },
        select: { id: true, name: true }
      })).map(cls => [cls.id, cls.name])
    );

    // Busca todas as perguntas e choices de todos os textos
    const questionsByText = {};
    const allQuestions = await prisma.question.findMany({
      where: { textId: { in: textIds } },
      include: { choices: true }
    });

    // Busca todas as respostas dos alunos para as perguntas desses textos
    const allQuestionIds = allQuestions.map(q => q.id);
    const allAnswers = await prisma.answer.findMany({
      where: { questionId: { in: allQuestionIds } },
      select: { questionId: true, studentId: true, choiceId: true }
    });

    // Organiza respostas por pergunta
    const answersByQuestion = {};
    allAnswers.forEach(ans => {
      if (!answersByQuestion[ans.questionId]) answersByQuestion[ans.questionId] = [];
      answersByQuestion[ans.questionId].push({ studentId: ans.studentId, choiceId: ans.choiceId });
    });

    allQuestions.forEach(q => {
      if (!questionsByText[q.textId]) questionsByText[q.textId] = [];
      questionsByText[q.textId].push({
        id: q.id,
        statement: q.statement,
        choices: q.choices.map(c => ({ id: c.id, text: c.text, isCorrect: c.isCorrect })),
        answers: answersByQuestion[q.id] || [] // <-- respostas dos alunos para esta pergunta
      });
    });

    // Monta lista de textos com todos os alunos das turmas e suas notas
    const texts = textIds.map(textId => {
      const textObj = classTexts.find(ct => ct.textId === textId)?.text;
      const turmasDoTexto = classTexts.filter(ct => ct.textId === textId).map(ct => ct.classId);
      const alunos = classUsers.filter(cu => turmasDoTexto.includes(cu.classId));
      const students = alunos.map(cu => {
        const perf = performances.find(p => p.textId === textId && p.classId === cu.classId && p.studentId === cu.studentId);
        return {
          id: cu.student.id,
          name: cu.student.name,
          grade: perf ? perf.grade : null,
          classId: cu.classId,
          className: classMap[cu.classId] || '',
          // Adiciona respostas do aluno para cada pergunta deste texto
          questions: [] // será preenchido no frontend ou em ajuste futuro
        };
      });
      return {
        id: textObj.id,
        name: textObj.name,
        students,
        questions: questionsByText[textId] || []
      };
    });
    return Response.json({ texts });
  } catch (error) {
    return handleError(error);
  }
}

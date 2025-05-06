const AppError = require("@/lib/appError");
const prisma = require("@/lib/prisma");

const show = async (classId, textId, studentId) => {
  let grade = null; 
  const classText = await prisma.classText.findFirst({
    where: {
      classId,
      textId
    }
  });

  if(!classText) {
    throw new AppError("Texto não encontrado!", 404);
  }

  const text = await prisma.text.findFirst({
    where: {
      id: textId
    }
  });

  const questions = await prisma.question.findMany({
    where: {
      textId: text.id,
      active: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  for(const question of questions) {
    const choices = await prisma.choice.findMany({
      where: {
        questionId: question.id
      }
    });

    question.choices = choices;
    const answer = await prisma.answer.findFirst({
      where: {
        questionId: question.id,
        studentId
      }
    });

    if(answer) {
      question.selectedChoiceId = answer.choiceId;

      const performance = await prisma.performance.findFirst({
        where: {
          studentId,
          textId
        }
      });

      grade = performance.grade;
    }
  }

  const textObj = {
    grade,
    text,
    questions
  };

  return textObj;
};

const createAnswer = async (classId, textId, userId, questions) => {
  const validatePerformance = await prisma.performance.findFirst({
    where: {
      studentId: userId,
      classId,
      textId
    }
  });

  if(validatePerformance) {
    throw new AppError("Essa leitura já foi respondida pelo aluno!", 400);
  }

  await prisma.$transaction(async (prisma) => {
    const numberOfQuestions = questions.length;
    let grade = 0;

    for(let question of questions) {

      await prisma.answer.create({
        data: {
          questionId: question.id,
          choiceId: question.selectedChoiceId,
          studentId: userId          
        }
      });

      const correctChoice = question.choices.filter(c => c.isCorrect)[0];
      if(correctChoice.id === question.selectedChoiceId) {
        grade+=10;
      }
    }

    grade = Number((grade / numberOfQuestions).toFixed(2));
    await prisma.performance.create({
      data: {
        studentId: userId,
        classId,
        textId,
        grade
      }
    });

    const numberOfTexts = await prisma.classText.count({
      where: {
        classId
      }
    });

    const totalGrade = await prisma.performance.aggregate({
      _sum: {
        grade: true,
      },
      where: {
        studentId: userId,
        classId
      }
    });
    
    const finalGrade = Number((totalGrade._sum.grade / numberOfTexts).toFixed(2));
    await prisma.classUser.update({
      where: {
        classId_studentId: {
          studentId: userId,
          classId
        },
      },
      data: {
        grade: finalGrade
      }
    });
  });
};

module.exports = {
  show,
  createAnswer
};

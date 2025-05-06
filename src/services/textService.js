import FireBaseStorage from "@/lib/fireBaseStorage";
const AppError = require("@/lib/appError");
const prisma = require("@/lib/prisma");
const difficulties = require("@/lib/difficulties");
const getImageNameFromFireBaseUrl = require("@/lib/urlHelper");

const getByName = async (name) => {
  if(!name) {
    name = "";  
  }

  const texts = await prisma.text.findMany({
    where: {
      name: {
        contains: name,
        mode: "insensitive"
      }, 
      active: true
    },
    orderBy: {
      name: "asc"
    }
  });
  texts.map(x => x.difficulty = difficulties[x.difficulty]);

  return texts;
};

const deleteById = async (id) => {
  const text = await prisma.text.findFirst({
    where: {
      id
    }
  });

  if(!text) {
    throw new AppError("Texto não encontrado!", 404);
  }

  await prisma.text.update({
    where: {
      id: text.id
    },
    data: {
      active: false
    }
  });
};

const getById = async (id) => {
  const text = await prisma.text.findFirst({
    where: {
      id
    }
  });

  if(!text) {
    throw new AppError("Texto não encontrado!", 404);
  }

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
  }

  const textObj = {
    text,
    questions
  };

  return textObj;
};

const validateName = async(id, name) => {
  let text;
  if(id) {
    text = await prisma.text.findFirst({
      where: {
        name: name,
        id: {
          not: id
        }
      }
    });
  } else {
    text = await prisma.text.findFirst({
      where: {
        name
      }
    });
  }

  if(text) {
    throw new AppError("Esse nome já está vinculado a outro texto!");
  }
};

const create = async ({ name, difficulty, content, questions }) => {
  await validateName(null, name);
  const result = await prisma.$transaction(async (prisma) => {
    const newText = await prisma.text.create({
      data: {
        name,
        difficulty,
        content
      }
    });

    for (const question of questions) {
      const newQuestion = await prisma.question.create({
        data: {
          statement: question.statement,
          textId: newText.id, 
        }
      });

      for(const choice of question.choices) {
        await prisma.choice.create({
          data: {
            questionId: newQuestion.id,
            isCorrect: choice.isCorrect,
            content: choice.content
          }
        });
      }
    }

    return newText.id;
  });

  return result;
};

const createNewQuestions = async(questions, id) => {
  for (const question of questions.filter(q => !q.id)) { 
    const newQuestion = await prisma.question.create({
      data: {
        statement: question.statement,
        textId: id, 
      }
    });

    for(const choice of question.choices) {
      await prisma.choice.create({
        data: {
          questionId: newQuestion.id,
          isCorrect: choice.isCorrect,
          content: choice.content
        }
      });
    }
  }
};

const inactivateRemovedQuestions = async(questions, oldQuestions) => {
  oldQuestions = oldQuestions.filter(oldQ => 
    !questions.some(newQ => newQ.id === oldQ.id)
  );

  for (const removedQuestion of oldQuestions) {
    await prisma.question.update({
      where: {
        id: removedQuestion.id
      },
      data: {
        active: false
      }
    });
  }
};

const updateQuestions = async(questions, oldQuestions) => {
  questions = questions.filter(upQ => 
    oldQuestions.some(oldQ => oldQ.id === upQ.id)
  );

  for (const updatedQuestion of questions) {
    await prisma.question.update({
      where: {
        id: updatedQuestion.id
      },
      data: {
        statement: updatedQuestion.statement
      }
    });

    for(const choice of updatedQuestion.choices) {
      await prisma.choice.update({
        where: {
          id: choice.id
        },
        data: {
          isCorrect: choice.isCorrect,
          content: choice.content
        }
      });
    }
  }
};

const update = async ({ id, name, difficulty, content, questions }) => {
  await validateName(id, name);
  
  const oldQuestions = await prisma.question.findMany({
    where: {
      textId: id
    }
  });

  await prisma.$transaction(async (prisma) => {
    await prisma.text.update({
      where: {
        id: id
      },
      data: {
        name: name,
        difficulty: difficulty,
        content: content
      }
    });
  
    await createNewQuestions(questions, id);
    await inactivateRemovedQuestions(questions, oldQuestions);
    await updateQuestions(questions, oldQuestions);
  });
};

const updateCover = async ({ textId, file }) => {
  const text = await getById(textId);
  if(!text) {
    throw new AppError("Não existe texto com esse ID!", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name;
  const fireBaseStorage = new FireBaseStorage();
  const uniqueFileName = await fireBaseStorage.save(fileName, buffer);

  if(text.coverUrl) {
    const fileDeleteName = getImageNameFromFireBaseUrl(text.coverUrl);
    fireBaseStorage.delete(fileDeleteName);
  }

  await prisma.text.update({
    where: {
      id: textId
    },
    data: {
      coverUrl: uniqueFileName
    }
  });

  return uniqueFileName;
};

module.exports = {
  create,
  update,
  getById,
  updateCover,
  getByName,
  deleteById
};

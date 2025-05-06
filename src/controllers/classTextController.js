const classTextService = require("@/services/classTextService");
const createResponse = require("@/lib/responseHelper");
const AppError = require("@/lib/appError");

const show = async (classId, textId, userId) => {
  const classText = await classTextService.show(classId, textId, userId);
  return createResponse({ body: { classText }, status: 200 });
};

const createAnswer = async (classId, textId, userId, req) => {
  const { questions } = await req.json();
  if(!questions) {
    throw new AppError("Campos obrigatórios não informados!");
  }

  await classTextService.createAnswer(classId, textId, userId, questions);
  return createResponse({ body: { message: "Respondido com sucesso!"}, status: 200 });
};

module.exports = {
  show,
  createAnswer
};

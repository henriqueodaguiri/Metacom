const classService = require("@/services/classService");
const createResponse = require("@/lib/responseHelper");
const AppError = require("@/lib/appError");

const index = async (req, name, userId, userRole) => {
  const classroom = await classService.getByName(name, userId, userRole);
  return createResponse({ body: { classroom: classroom }, status: 200 });
};

const show = async (classId, userId, userRole) => {
  const classroom = await classService.getById(classId, userId, userRole);
  return createResponse({ body: { classroom }, status: 200 });
};

const exportExcel = async (classId, userId) => {
  const excelBuffer = await classService.createExcel(classId, userId);
  return new Response(excelBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="class_${classId}.xlsx"`,
    },
  });
};

const destroy = async (classId, userId) => {
  await classService.deleteById(classId, userId);
  return createResponse({ body: { message: "Inativado com sucesso!"}, status: 200 });
};

const removeStudent = async (classId, studentId, teacherId) => {
  await classService.removeStudent(classId, studentId, teacherId);
  return createResponse({ body: { message: "Removido com sucesso!"}, status: 200 });
};

const removeText = async (classId, textId, teacherId) => {
  await classService.removeText(classId, textId, teacherId);
  return createResponse({ body: { message: "Removido com sucesso!"}, status: 200 });
};

const addText = async (classId, textId, teacherId) => {
  await classService.addText(classId, textId, teacherId);
  return createResponse({ body: { message: "Adicionado com sucesso!"}, status: 201 });
};

const create = async (req, userId) => {
  const { name } = await req.json();
  if(!name) {
    throw new AppError("Dados obrigatórios não informados!", 400);
  }

  const classroom = await classService.create({ name, userId });
  return createResponse({ body: { classroom }, status: 201 });
};

const join = async (req, userId) => {
  const { accessKey } = await req.json();
  if(!accessKey) {
    throw new AppError("Dados obrigatórios não informados!", 400);
  }

  await classService.join({ accessKey, userId });
  return createResponse({ body: { message: "Ingressado com sucesso!"}, status: 200 });
};

const update = async (req, classId, userId) => {
  const { name } = await req.json();
  if(!name) {
    throw new AppError("Dados obrigatórios não informados!", 400);
  }

  await classService.update({ id: classId, name, userId });
  return createResponse({ status: 201 });
};

module.exports = {
  create,
  update,
  index,
  show,
  destroy,
  removeStudent,
  removeText,
  addText,
  exportExcel,
  join
};

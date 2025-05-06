const userService = require("@/services/userService");
const createResponse = require("@/lib/responseHelper");

const create = async (req) => {
  const { name, email, password } = await req.json();
  await userService.create({ name, email, password });
  
  return createResponse({ status: 201 });
};

const getStudentUndoneTexts = async (id) => {
  const undoneTexts = await userService.getStudentUndoneTexts(id);
  return createResponse({ body: { undoneTexts }, status: 200 });
};

const update = async (req, userId) => {
  const { name, email, old_password, new_password } = await req.json();
  await userService.update({ userId, name, email, old_password, new_password });

  return createResponse({ status: 201 });
};

const updateAvatar = async (req, userId) => {
  const formData = await req.formData();
  const file = formData.get("avatar");

  if(!file) {
    return createResponse({ body: { message: "Não foi enviado key 'avatar'" }, status: 400 });
  }

  const uniqueFileName = await userService.updateAvatar({ userId, file });
  return createResponse({ body: { avatar: uniqueFileName },status: 201 });
};

module.exports = {
  updateAvatar,
  create,
  update,
  getStudentUndoneTexts
};

import handleError from "@/lib/errorHandler";
import roles from "@/lib/roles";
import { verifyToken } from "@/middleware/authMiddleware";
import { verifyRole } from "@/middleware/roleMiddleware";
const textController = require("@/controllers/textController");

export async function PATCH(req, { params }) {
  try {
    const tokenInfo =  verifyToken(req);
    verifyRole(tokenInfo, roles.TEACHER);
    const textId = Number(params.id);

    return await textController.updateCover(req, textId);
  } catch(error) {
    return handleError(error);
  }
}

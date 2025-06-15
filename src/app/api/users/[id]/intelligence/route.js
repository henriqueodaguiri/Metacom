import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const prisma = require("@/lib/prisma");

// GET /api/users/[id]/intelligence
export async function GET(req, { params }) {
  try {
    const userId = Number(params.id);
    if (!userId) return Response.json({ result: null }, { status: 400 });
    // Busca resultado de inteligências múltiplas do aluno
    const result = await prisma.learningResult.findFirst({
      where: { userId },
    });
    return Response.json({ result });
  } catch (error) {
    return handleError(error);
  }
}

import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const prisma = require("@/lib/prisma");

export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) return Response.json({ result: null }, { status: 400 });
    const userId = Number(id);
    if (!userId) return Response.json({ result: null }, { status: 400 });
    const result = await prisma.learningPreferences.findUnique({
      where: { userId }
    });
    return Response.json({ result });
  } catch (error) {
    console.error("Erro ao buscar estilos de aprendizagem:", error);
    return handleError(error);
  }
}

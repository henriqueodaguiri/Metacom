import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
const prisma = require("@/lib/prisma");

// GET /api/users/[id]
export async function GET(req, { params }) {
  try {
    // Autenticação opcional, pode ser removida se não quiser exigir token
    verifyToken(req);
    const userId = Number(params.id);
    if (!userId) return Response.json({ error: "ID inválido" }, { status: 400 });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });
    if (!user) return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    return Response.json({ user });
  } catch (error) {
    return handleError(error);
  }
}

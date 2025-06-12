import handleError from "@/lib/errorHandler";
import { verifyToken } from "@/middleware/authMiddleware";
// import { prisma } from "@/lib/prisma";
const prisma = require("@/lib/prisma");

export async function POST(req) {
  try {
    const tokenInfo = verifyToken(req); // Recupera o usuário autenticado
    const { percentages } = await req.json();

    // Salva ou atualiza o resultado no banco, associando ao usuário autenticado
    const result = await prisma.learningPreferences.upsert({
      where: { userId: tokenInfo.userId },
      update: {
        percentages,
        createdAt: new Date()
      },
      create: {
        userId: tokenInfo.userId,
        percentages,
        createdAt: new Date()
      }
    });

    return Response.json({ message: "Resultado salvo!", result });
  } catch (error) {
    console.error("Erro ao salvar resultado:", error);
    return handleError(error);
  }
}

export async function GET(req) {
  try {
    const tokenInfo = verifyToken(req);
    const result = await prisma.LearningPreferences.findUnique({
      where: { userId: tokenInfo.userId }
    });
    return Response.json({ result });
  } catch (error) {
    console.error("Erro ao buscar resultado:", error);
    return handleError(error);
  }
}
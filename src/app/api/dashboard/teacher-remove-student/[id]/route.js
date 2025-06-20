import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

// Remove o aluno de todas as turmas do professor logado
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }
    const teacherId = session.user.id;
    const studentId = params.id;
    if (!studentId) {
      return NextResponse.json({ message: "ID do aluno não informado" }, { status: 400 });
    }
    // Busca todas as turmas do professor
    const classes = await prisma.class.findMany({
      where: { teacherId },
      select: { id: true }
    });
    const classIds = classes.map(c => c.id);
    if (classIds.length === 0) {
      return NextResponse.json({ message: "Nenhuma turma encontrada para este professor." }, { status: 404 });
    }
    // Remove o aluno de todas as turmas do professor
    await prisma.class_user.deleteMany({
      where: {
        userId: studentId,
        classId: { in: classIds }
      }
    });
    return NextResponse.json({ message: "Aluno removido de todas as turmas do professor." });
  } catch (e) {
    console.error("Erro ao remover aluno de todas as turmas do professor:", e);
    return NextResponse.json({ message: "Erro ao remover aluno.", error: e?.message || e }, { status: 500 });
  }
}

// Importa o Prisma Client e o bcrypt para hash de senhas
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

// Cria usuários iniciais: 1 professor e 20 alunos
async function createUsers() {
  const saltRounds = 10;
  const password = "123";
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Cria ou atualiza o usuário professor
  await prisma.user.upsert({
    where: { email: "teacher@example.com" },
    update: {},
    create: {
      email: "teacher@example.com",
      name: "Teacher One",
      password: hashedPassword,
      role: "TEACHER",
    },
  });

  // Cria ou atualiza 20 alunos
  for (let i = 1; i <= 20; i++) {
    await prisma.user.upsert({
      where: { email: `student${i}@example.com` },
      update: {},
      create: {
        email: `student${i}@example.com`,
        name: `Student ${i}`,
        password: hashedPassword,
      },
    });
  }
}

// Cria duas turmas e associa alunos a elas
async function createClasses() {
  // Busca o professor
  const teacher = await prisma.user.findFirst({
    where: { email: "teacher@example.com" },
  });

  // Cria ou atualiza duas turmas
  for (let i = 1; i <= 2; i++) {
    const accessKey = i === 1 ? "juQA6st0" : "1RctlB69";
    await prisma.class.upsert({
      where: { name: `Class ${i}` },
      update: {},
      create: {
        name: `Class ${i}`,
        teacherId: teacher.id,
        accessKey,
      },
    });
  }

  // Associa 10 alunos a cada turma
  const createdClasses = await prisma.class.findMany();
  for (let i = 0; i < createdClasses.length; i++) {
    for (let j = 1; j <= 10; j++) {
      const studentEmail = `student${i * 10 + j}@example.com`;
      const student = await prisma.user.findFirst({
        where: { email: studentEmail },
      });

      await prisma.classUser.upsert({
        where: {
          classId_studentId: {
            classId: createdClasses[i].id,
            studentId: student.id,
          },
        },
        update: {},
        create: {
          classId: createdClasses[i].id,
          studentId: student.id,
        },
      });
    }
  }
}

// Cria um texto de exemplo, questões e alternativas, e associa às turmas
async function createTextAndQuestions() {
  // Verifica se já existe o texto
  let newText = await prisma.text.findFirst({
    where: { name: "Sample Text" },
  });

  // Cria texto, questões e alternativas se não existir
  if (!newText) {
    newText = await prisma.text.create({
      data: {
        name: "Sample Text",
        content: "This is a sample text content.",
        difficulty: "REGULAR",
      },
    });

    // Cria 5 questões para o texto
    for (let i = 1; i <= 5; i++) {
      const question = await prisma.question.create({
        data: {
          textId: newText.id,
          statement: `Sample question ${i} about the text.`,
        },
      });

      // Cria 5 alternativas para cada questão (a primeira é correta)
      for (let j = 1; j <= 5; j++) {
        await prisma.choice.create({
          data: {
            questionId: question.id,
            isCorrect: j === 1,
            content: `Choice ${j} content.`,
          },
        });
      }
    }
  }

  // Associa o texto criado a todas as turmas
  const classes = await prisma.class.findMany();
  for (const cls of classes) {
    await prisma.classText.upsert({
      where: {
        classId_textId: {
          classId: cls.id,
          textId: newText.id,
        },
      },
      update: {},
      create: {
        classId: cls.id,
        textId: newText.id,
      },
    });
  }
}

// Cria respostas dos alunos e calcula desempenho
async function createAnswersAndPerformance() {
  // Busca a turma 1
  const class1 = await prisma.class.findFirst({
    where: { name: "Class 1" },
  });

  // Busca os 10 alunos da turma 1
  const studentsClass1 = await prisma.user.findMany({
    where: {
      email: {
        in: Array.from({ length: 10 }, (_, i) => `student${i + 1}@example.com`),
      },
    },
  });

  // Busca todas as questões
  const questions = await prisma.question.findMany();

  // Para cada aluno, cria respostas corretas e soma a nota
  for (const student of studentsClass1) {
    let totalGrade = 0;

    for (const question of questions) {
      const choices = await prisma.choice.findMany({
        where: { questionId: question.id },
      });

      const selectedChoice = choices.find((choice) => choice.isCorrect);

      // Evita duplicatas de respostas
      const existingAnswer = await prisma.answer.findFirst({
        where: {
          questionId: question.id,
          studentId: student.id,
        },
      });

      if (!existingAnswer && selectedChoice) {
        totalGrade += 2;
        await prisma.answer.create({
          data: {
            questionId: question.id,
            choiceId: selectedChoice.id,
            studentId: student.id,
          },
        });
      } else if (selectedChoice) {
        totalGrade += 2;
      }
    }

    // Evita duplicatas de performance
    const existingPerformance = await prisma.performance.findFirst({
      where: {
        studentId: student.id,
        classId: class1.id,
        textId: questions[0].textId,
      },
    });

    if (!existingPerformance) {
      await prisma.performance.create({
        data: {
          studentId: student.id,
          classId: class1.id,
          textId: questions[0].textId,
          grade: totalGrade,
        },
      });
    }
  }

  // Calcula média de desempenho dos alunos na turma
  const classTexts = await prisma.classText.findMany({
    where: { classId: class1.id },
  });

  for (const student of studentsClass1) {
    const performances = await prisma.performance.findMany({
      where: {
        studentId: student.id,
        classId: class1.id,
        textId: { in: classTexts.map((ct) => ct.textId) },
      },
    });

    const averageGrade =
      performances.reduce((sum, perf) => sum + perf.grade, 0) /
      (performances.length || 1);

    await prisma.classUser.update({
      where: {
        classId_studentId: {
          classId: class1.id,
          studentId: student.id,
        },
      },
      data: { grade: averageGrade },
    });
  }
}

// Cria inteligências de Armstrong (teoria das inteligências múltiplas)
async function createArmstrongIntelligences() {
  const intelligences = [
    "Lógico-matemática",
    "Linguística",
    "Espacial",
    "Musical",
    "Corporal-cinestésica",
    "Interpessoal",
    "Intrapessoal",
    "Naturalista",
  ];

  for (const intelligence of intelligences) {
    await prisma.armstrongIntelligence.upsert({
      where: { intelligence }, // Certifique-se que existe um unique no campo 'intelligence'
      update: {},
      create: { intelligence },
    });
  }
}

// Função principal que executa todas as etapas de seed
async function main() {
  await createUsers();
  await createClasses();
  await createTextAndQuestions();
  await createAnswersAndPerformance();
  await createArmstrongIntelligences();
}

// Executa o seed e trata erros
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
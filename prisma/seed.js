// Importa o Prisma Client e o bcrypt para hash de senhas
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

// Cria usuários iniciais: 1 professor e 120 alunos
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

  // Cria ou atualiza 120 alunos
  for (let i = 1; i <= 120; i++) {
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

// Cria 8 turmas e associa 15 alunos a cada uma
async function createClasses() {
  // Busca o professor
  const teacher = await prisma.user.findFirst({
    where: { email: "teacher@example.com" },
  });

  // Cria ou atualiza 8 turmas
  for (let i = 1; i <= 8; i++) {
    const accessKey = Math.random().toString(36).slice(2, 10);
    await prisma.class.upsert({
      where: { name_active: { name: `Class ${i}`, active: true } },
      update: {},
      create: {
        name: `Class ${i}`,
        teacherId: teacher.id,
        accessKey,
      },
    });
  }

  // Associa 15 alunos a cada turma (alunos não se repetem entre turmas)
  const createdClasses = await prisma.class.findMany();
  let studentCounter = 1;
  for (let i = 0; i < createdClasses.length; i++) {
    for (let j = 1; j <= 15; j++) {
      if (studentCounter > 120) break;
      const studentEmail = `student${studentCounter}@example.com`;
      const student = await prisma.user.findFirst({
        where: { email: studentEmail },
      });

      if (!student) {
        console.warn(`Aluno não encontrado: ${studentEmail}`);
        continue;
      }

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

      studentCounter++;
    }
  }
}

// Cria 5 textos de exemplo, cada um com 5 questões e 5 alternativas, e associa todos os textos a todas as turmas
async function createTextAndQuestions() {
  let texts = [];
  for (let t = 1; t <= 5; t++) {
    let newText = await prisma.text.findFirst({
      where: { name: `Sample Text ${t}` },
    });

    if (!newText) {
      newText = await prisma.text.create({
        data: {
          name: `Sample Text ${t}`,
          content: `This is a sample text content for text ${t}.`,
          difficulty: "REGULAR",
        },
      });

      // Cria 5 questões para o texto
      for (let i = 1; i <= 5; i++) {
        const question = await prisma.question.create({
          data: {
            textId: newText.id,
            statement: `Sample question ${i} about text ${t}.`,
          },
        });

        // Cria 5 alternativas para cada questão (a primeira é correta)
        for (let j = 1; j <= 5; j++) {
          await prisma.choice.create({
            data: {
              questionId: question.id,
              isCorrect: j === 1,
              content: `Choice ${j} content for question ${i} of text ${t}.`,
            },
          });
        }
      }
    }
    texts.push(newText);
  }

  // Associa todos os textos a todas as turmas
  const classes = await prisma.class.findMany();
  for (const cls of classes) {
    for (const text of texts) {
      await prisma.classText.upsert({
        where: {
          classId_textId: {
            classId: cls.id,
            textId: text.id,
          },
        },
        update: {},
        create: {
          classId: cls.id,
          textId: text.id,
        },
      });
    }
  }
}

// Cria respostas dos alunos (corretas e incorretas aleatórias) e calcula desempenho
async function createAnswersAndPerformance() {
  const classes = await prisma.class.findMany();

  for (const cls of classes) {
    // Busca os 15 alunos da turma
    const classUsers = await prisma.classUser.findMany({
      where: { classId: cls.id },
      include: { student: true },
    });
    const students = classUsers.map(cu => cu.student);

    // Busca todos os textos associados à turma
    const classTexts = await prisma.classText.findMany({
      where: { classId: cls.id },
    });

    let allQuestions = [];
    for (const ct of classTexts) {
      const questions = await prisma.question.findMany({
        where: { textId: ct.textId },
      });
      allQuestions.push(...questions);
    }

    // Para cada aluno, cria respostas aleatórias e soma a nota
    for (const student of students) {
      let totalGrade = 0;

      for (const question of allQuestions) {
        const choices = await prisma.choice.findMany({
          where: { questionId: question.id },
        });

        // Escolhe uma alternativa aleatória (pode ser correta ou não)
        const selectedChoice = choices[Math.floor(Math.random() * choices.length)];

        // Evita duplicatas de respostas
        const existingAnswer = await prisma.answer.findFirst({
          where: {
            questionId: question.id,
            studentId: student.id,
          },
        });

        if (!existingAnswer && selectedChoice) {
          if (selectedChoice.isCorrect) totalGrade += 2;
          await prisma.answer.create({
            data: {
              questionId: question.id,
              choiceId: selectedChoice.id,
              studentId: student.id,
            },
          });
        } else if (selectedChoice && existingAnswer && selectedChoice.isCorrect) {
          totalGrade += 2;
        }
      }

      // Evita duplicatas de performance para cada texto
      for (const ct of classTexts) {
        const questions = await prisma.question.findMany({
          where: { textId: ct.textId },
        });
        let grade = 0;
        for (const question of questions) {
          const answer = await prisma.answer.findFirst({
            where: {
              questionId: question.id,
              studentId: student.id,
            },
            include: { choice: true },
          });
          if (answer && answer.choice.isCorrect) grade += 2;
        }

        const existingPerformance = await prisma.performance.findFirst({
          where: {
            studentId: student.id,
            classId: cls.id,
            textId: ct.textId,
          },
        });

        if (!existingPerformance) {
          await prisma.performance.create({
            data: {
              studentId: student.id,
              classId: cls.id,
              textId: ct.textId,
              grade: grade,
            },
          });
        }
      }
    }

    // Calcula média de desempenho dos alunos na turma
    for (const student of students) {
      const performances = await prisma.performance.findMany({
        where: {
          studentId: student.id,
          classId: cls.id,
          textId: { in: classTexts.map((ct) => ct.textId) },
        },
      });

      const averageGrade =
        performances.reduce((sum, perf) => sum + perf.grade, 0) /
        (performances.length || 1);

      await prisma.classUser.update({
        where: {
          classId_studentId: {
            classId: cls.id,
            studentId: student.id,
          },
        },
        data: { grade: averageGrade },
      });
    }
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
      where: { intelligence },
      update: {},
      create: { intelligence },
    });
  }
}

// Preenche LearningResult, LearningPreferences e ArmstrongIntelligences para cada aluno criado de forma aleatória
async function createLearningDataForStudents() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { id: 'asc' }
  });

  for (let idx = 0; idx < students.length; idx++) {
    const student = students[idx];

    // LearningResult (Inventário das Inteligências Múltiplas)
    let lr = Array(8).fill(0).map(() => Math.random());
    const lrSum = lr.reduce((a, b) => a + b, 0);
    lr = lr.map(v => Number(((v / lrSum) * 100).toFixed(2)));
    lr[7] = Number((100 - lr.slice(0, 7).reduce((a, b) => a + b, 0)).toFixed(2));
    await prisma.learningResult.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        percentages: lr,
        createdAt: new Date(),
      },
    });

    // LearningPreferences (CHAEA)
    let lp = Array(4).fill(0).map(() => Math.random());
    const lpSum = lp.reduce((a, b) => a + b, 0);
    lp = lp.map(v => Number(((v / lpSum) * 100).toFixed(2)));
    lp[3] = Number((100 - lp.slice(0, 3).reduce((a, b) => a + b, 0)).toFixed(2));
    await prisma.learningPreferences.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        percentages: lp,
        createdAt: new Date(),
      },
    });

    // ArmstrongIntelligences (associa cada aluno a uma inteligência aleatória)
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
    const randomIntelligence = intelligences[Math.floor(Math.random() * intelligences.length)];
    await prisma.armstrongIntelligence.upsert({
      where: { intelligence: randomIntelligence },
      update: {},
      create: { intelligence: randomIntelligence },
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
  await createLearningDataForStudents();
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
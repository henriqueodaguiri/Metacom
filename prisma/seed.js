const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function createUsers() {
  const saltRounds = 10;
  const password = "123";
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const teacher = await prisma.user.create({
    data: {
      email: "teacher@example.com",
      name: "Teacher One",
      password: hashedPassword,
      role: "TEACHER",
    },
  });

  const students = [];
  for (let i = 1; i <= 20; i++) {
    students.push({
      email: `student${i}@example.com`,
      name: `Student ${i}`,
      password: hashedPassword,
    });
  }

  await prisma.user.createMany({
    data: students,
  });
}

async function createClasses() {
  const teacher = await prisma.user.findFirst({
    where: { email: "teacher@example.com" },
  });

  const classes = [];
  for (let i = 1; i <= 2; i++) {
    const accessKey = i === 1 ? "juQA6st0" : "1RctlB69";
    classes.push({
      name: `Class ${i}`,
      teacherId: teacher.id,
      accessKey,
    });
  }

  await prisma.class.createMany({
    data: classes,
  });

  const createdClasses = await prisma.class.findMany();
  for (let i = 0; i < createdClasses.length; i++) {
    for (let j = 1; j <= 10; j++) {
      const studentEmail = `student${i * 10 + j}@example.com`;
      const student = await prisma.user.findFirst({
        where: { email: studentEmail },
      });

      await prisma.classUser.create({
        data: {
          classId: createdClasses[i].id,
          studentId: student.id,
        },
      });
    }
  }
}

async function createTextAndQuestions() {
  const newText = await prisma.text.create({
    data: {
      name: "Sample Text",
      content: "This is a sample text content.",
      difficulty: "REGULAR",
    },
  });

  const classes = await prisma.class.findMany();
  for (const cls of classes) {
    await prisma.classText.create({
      data: {
        classId: cls.id,
        textId: newText.id,
      },
    });
  }

  for (let i = 1; i <= 5; i++) {
    const question = await prisma.question.create({
      data: {
        textId: newText.id,
        statement: `Sample question ${i} about the text.`,
      },
    });

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

async function createAnswersAndPerformance() {
  const class1 = await prisma.class.findFirst({
    where: { name: "Class 1" },
  });

  const studentsClass1 = await prisma.user.findMany({
    where: {
      email: {
        in: Array.from({ length: 10 }, (_, i) => `student${i + 1}@example.com`),
      },
    },
  });

  const questions = await prisma.question.findMany();

  for (const student of studentsClass1) {
    let totalGrade = 0;

    for (const question of questions) {
      const choices = await prisma.choice.findMany({
        where: { questionId: question.id },
      });

      const selectedChoice = choices.find((choice) => choice.isCorrect);
      totalGrade += selectedChoice ? 2 : 0;

      await prisma.answer.create({
        data: {
          questionId: question.id,
          choiceId: selectedChoice.id,
          studentId: student.id,
        },
      });
    }

    await prisma.performance.create({
      data: {
        studentId: student.id,
        classId: class1.id,
        textId: questions[0].textId,
        grade: totalGrade,
      },
    });
  }

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
      performances.length;

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

async function main() {
  await createUsers();
  await createClasses();
  await createTextAndQuestions();
  await createAnswersAndPerformance();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import generateRandomCode from "@/lib/generateRandomCode";
import roles from "@/lib/roles";
const AppError = require("@/lib/appError");
const prisma = require("@/lib/prisma");
const XLSX = require("xlsx");

const join = async({ accessKey, userId }) => {
  const classroom = await prisma.class.findFirst({
    where: {
      accessKey
    }
  });

  if(!classroom) {
    throw new AppError("Turma não encontrada!", 404);
  }

  const checkUserInClass = await prisma.class.findFirst({
    where: {
      id: classroom.id,
      classUser: {
        some: {
          studentId: userId
        }
      }
    }
  });

  if(checkUserInClass) {
    throw new AppError("Você já pertence a essa turma!", 400);
  }

  await prisma.classUser.create({
    data: {
      classId: classroom.id,
      studentId: userId
    }
  });
};

const getByName = async (name = "", userId, role) => {
  const baseQuery = {
    where: {
      name: {
        contains: name,
        mode: "insensitive",
      },
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  };

  if (role === roles.TEACHER) {
    baseQuery.where.teacherId = userId;
  } else {
    baseQuery.where.classUser = {
      some: {
        studentId: userId,
      },
    };
  }

  const classes = await prisma.class.findMany(baseQuery);
  return classes;
};

const deleteById = async (id, userId) => {
  const classroom = await prisma.class.findFirst({
    where: {
      id
    }
  });

  if(!classroom) {
    throw new AppError("Turma não encontrada!", 404);
  }

  if(classroom.teacherId !== userId) {
    throw new AppError("Você não é o professor da turma!", 404);
  }

  await prisma.class.update({
    where: {
      id: classroom.id
    },
    data: {
      active: false
    }
  });
};

const removeStudent = async (classId, studentId, teacherId) => {
  const classroom = await prisma.class.findFirst({
    where: {
      id: classId
    }
  });

  if(!classroom) {
    throw new AppError("Turma não encontrada!", 404);
  }

  if(classroom.teacherId !== teacherId) {
    throw new AppError("Você não é o professor da turma!", 404);
  }

  const student = await prisma.user.findFirst({
    where: {
      id: studentId,
      role: roles.STUDENT
    }
  });

  if(!student) {
    throw new AppError("Aluno não encontrado!", 404);
  }

  const classUser = await prisma.classUser.findFirst({
    where: {
      classId,
      studentId
    }
  });

  if(!classUser) {
    throw new AppError("Aluno não faz parte da turma!", 404);
  }
  
  await prisma.classUser.delete({
    where: {
      classId_studentId: {
        classId,
        studentId
      }
    }
  });
};

const removeText = async (classId, textId, teacherId) => {
  const classroom = await prisma.class.findFirst({
    where: {
      id: classId
    }
  });

  if(!classroom) {
    throw new AppError("Turma não encontrada!", 404);
  }

  if(classroom.teacherId !== teacherId) {
    throw new AppError("Você não é o professor da turma!", 404);
  }

  const text = await prisma.text.findFirst({
    where: {
      id: textId
    }
  });

  if(!text) {
    throw new AppError("Texto não encontrado!", 404);
  }

  const classText = await prisma.classText.findFirst({
    where: {
      classId,
      textId
    }
  });

  if(!classText) {
    throw new AppError("Texto não faz parte da turma!", 404);
  }

  const performances = await prisma.performance.findFirst({
    where: {
      textId,
      classId
    }
  });

  if(performances) {
    throw new AppError("Não é possível excluir pois já houveram respostas!", 404);
  }

  await prisma.classText.delete({
    where: {
      classId_textId: {
        classId,
        textId
      }
    }
  });

  await updateGrades(classId);
};

const createExcel = async (classId, teacherId) => {
  const classroom = await prisma.class.findFirst({
    where: {
      id: classId
    }
  });

  if(!classroom) {
    throw new AppError("Turma não encontrada!", 404);
  }

  if(classroom.teacherId !== teacherId) {
    throw new AppError("Você não é o professor da turma!", 404);
  }

  const students = await prisma.user.findMany({
    where: {
      classUser: {
        some: {
          classId: classId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true
    },
  });

  if (students.length === 0) {
    throw new AppError("Nenhum estudante encontrado nesta turma!", 404);
  }

  const classUsers = await prisma.classUser.findMany({
    where: {
        classId
      }
  });

  const studentsFormatted = students.map(s => ({
    "Nome": s.name,
    "E-mail": s.email,
    "Nota": classUsers.filter(x => x.studentId === s.id)[0].grade,
  }));

  const worksheet = XLSX.utils.json_to_sheet(studentsFormatted);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, classroom.name);

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  return excelBuffer;
};

const addText = async (classId, textId, teacherId) => {
  const classroom = await prisma.class.findFirst({
    where: {
      id: classId
    }
  });

  if(!classroom) {
    throw new AppError("Turma não encontrada!", 404);
  }

  if(classroom.teacherId !== teacherId) {
    throw new AppError("Você não é o professor da turma!", 404);
  }

  const text = await prisma.text.findFirst({
    where: {
      id: textId
    }
  });

  if(!text) {
    throw new AppError("Texto não encontrado!", 404);
  }

  const classText = await prisma.classText.findFirst({
    where: {
      classId,
      textId
    }
  });

  if(classText) {
    throw new AppError("Texto já faz parte da turma!", 404);
  }

  await prisma.classText.create({
    data: {
      classId,
      textId
    }
  });

  await updateGrades(classId);
};

const updateGrades = async (classId) => {
  const textsFromClassroom = await prisma.classText.findMany({
    where: {
      classId
    }
  });
  const textIds = textsFromClassroom.map(x => x.textId);

  if(textIds.length === 0) {
    return;
  }

  const performances = await prisma.performance.findMany({
    where: {
      classId,
      textId: {
        in: textIds
      }
    }
  });

  const studentsId = new Set(performances.map(x => x.studentId));

  console.log(textIds.length);
  for(let id of studentsId) {
    const grade = performances
      .filter(p => p.studentId === id)
      .map(p => p.grade)
      .reduce((sum, curr) => sum + curr, 0);
      
    const newGrade = parseFloat((grade / textIds.length).toFixed(2));
    await prisma.classUser.update({
      where: {
        classId_studentId: {
          classId: classId,
          studentId: id,
        },
      },
      data: {
        grade: newGrade
      }
    });
  }
};

const getById = async (id, userId, role) => {
  const isTeacher = role === roles.TEACHER;

  const classroom = await prisma.class.findFirst({
    where: { id },
    select: {
      id: true,
      accessKey: isTeacher,
      name: true,
      createdAt: isTeacher,
      updatedAt: isTeacher,
      active: true,
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      classUser: {
        where: isTeacher ? {} : { studentId: userId },
        select: {
          grade: true,
          student: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              performances: {
                where: { classId: id },
                select: {
                  id: true,
                  grade: true,
                  classText: {
                    select: {
                      text: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      classText: {
        select: {
          text: {
            select: {
              id: true,
              name: true,
              difficulty: true,
              coverUrl: true,
            },
          },
        },
      },
    },
  });

  if (!classroom) {
    throw new AppError("Turma não encontrada!", 404);
  }

  if (isTeacher && classroom.teacher.id !== userId) {
    throw new AppError("Você não é o professor dessa turma!", 403);
  }

  if (!isTeacher && (!classroom.classUser || classroom.classUser.length === 0)) {
    throw new AppError("Você não pertence a essa turma!", 403);
  }

  const students = classroom.classUser.map((x) => ({
    ...x.student,
    grade: x.grade,
    performances: x.student.performances.map((performance) => ({
      id: performance.id,
      grade: performance.grade,
      text: performance.classText.text,
    })),
  })).sort((a, b) => a.name.localeCompare(b.name));

  const texts = classroom.classText.map((x) => x.text)
    .sort((a, b) => a.name.localeCompare(b.name));

  delete classroom.classUser;
  delete classroom.classText;

  return {
    ...classroom,
    texts,
    students,
  };
};

const validateName = async(id, name) => {
  let classroom;
  if(id) {
    classroom = await prisma.class.findFirst({
      where: {
        name: name,
        active: true,
        id: {
          not: id
        }
      }
    });
  } else {
    classroom = await prisma.class.findFirst({
      where: {
        name,
        active: true,
      }
    });
  }

  if(classroom) {
    throw new AppError("Esse nome já está vinculado a outra turma!");
  }
};

const create = async ({ name, userId: teacherId }) => {
  const teacher = await prisma.user.findFirst({
    where: {
      id: teacherId,
      role: roles.TEACHER
    }
  });

  if(!teacher) {
    throw new AppError("Professor inválido!");
  }

  await validateName(null, name);

  const accessKey = generateRandomCode(8);
  const newClass = await prisma.class.create({
    data: {
      name,
      teacherId,
      accessKey
    }
  });

  return newClass;
};

const update = async ({ id, name, userId }) => {
  await validateName(id, name);
  const classroom = await prisma.class.findUnique({
    where: {
      id
    }
  });

  if(!classroom) {
    throw new AppError("Turma não encontrada!");
  }

  if(classroom.teacherId !== userId) {
    throw new AppError("Você não é o professor da turma!", 404);
  }

  await prisma.class.update({
    where: {
      id: id
    },
    data: {
      name: name
    }
  });
};

module.exports = {
  create,
  update,
  getById,
  getByName,
  deleteById,
  removeStudent,
  removeText,
  addText,
  createExcel,
  join,
  updateGrades
};

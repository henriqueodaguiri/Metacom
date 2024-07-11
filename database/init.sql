-- Criação do esquema
CREATE SCHEMA metacognicao;

-- Usar o esquema criado
SET search_path TO metacognicao;

-- Tabela de Usuário
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(10) NOT NULL
);

-- Tabela de Aluno
CREATE TABLE aluno (
    usuario_id INT PRIMARY KEY,
    turma VARCHAR(50),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- Tabela de Professor
CREATE TABLE professor (
    usuario_id INT PRIMARY KEY,
    disciplina VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- Tabela de Turma
CREATE TABLE turma (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    professor_id INT,
    cor_identificacao VARCHAR(50),
    FOREIGN KEY (professor_id) REFERENCES professor(usuario_id)
);

-- Tabela de Tema de Leitura
CREATE TABLE temaleitura (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    professor_id INT,
    imagem_thumbnail VARCHAR(255),
    FOREIGN KEY (professor_id) REFERENCES professor(usuario_id)
);

-- Tabela de Texto
CREATE TABLE texto (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    conteudo TEXT NOT NULL,
    dificuldade INT,
    tema_id INT,
    FOREIGN KEY (tema_id) REFERENCES temaleitura(id)
);

-- Tabela de Imagem
CREATE TABLE imagem (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    dificuldade INT
);

-- Tabela de Pergunta
CREATE TABLE pergunta (
    id SERIAL PRIMARY KEY,
    texto_id INT,
    enunciado TEXT NOT NULL,
    dificuldade INT,
    FOREIGN KEY (texto_id) REFERENCES texto(id)
);

-- Tabela de Resposta
CREATE TABLE resposta (
    id SERIAL PRIMARY KEY,
    pergunta_id INT,
    conteudo TEXT NOT NULL,
    correta BOOLEAN NOT NULL,
    FOREIGN KEY (pergunta_id) REFERENCES pergunta(id)
);

-- Tabela de Pontuação
CREATE TABLE pontuacao (
    id SERIAL PRIMARY KEY,
    aluno_id INT,
    pontuacao INT NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES aluno(usuario_id)
);

-- Tabela de Dashboard
CREATE TABLE dashboard (
    id SERIAL PRIMARY KEY,
    professor_id INT,
    aluno_id INT,
    progresso INT NOT NULL,
    FOREIGN KEY (professor_id) REFERENCES professor(usuario_id),
    FOREIGN KEY (aluno_id) REFERENCES aluno(usuario_id)
);

-- Tabela de Relacionamento Turma_Aluno
CREATE TABLE turma_aluno (
    turma_id INT,
    aluno_id INT,
    PRIMARY KEY (turma_id, aluno_id),
    FOREIGN KEY (turma_id) REFERENCES turma(id),
    FOREIGN KEY (aluno_id) REFERENCES aluno(usuario_id)
);

-- Tabela de Relacionamento Turma_Tema
CREATE TABLE turma_tema (
    turma_id INT,
    tema_id INT,
    PRIMARY KEY (turma_id, tema_id),
    FOREIGN KEY (turma_id) REFERENCES turma(id),
    FOREIGN KEY (tema_id) REFERENCES temaleitura(id)
);

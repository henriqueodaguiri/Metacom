"use client";
import { useState, useEffect } from "react";
import { Container } from "./styles";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import './styles.css';
import Modal from "react-modal";
import { FaQuestionCircle } from "react-icons/fa";
import { GiRunningShoe, GiThink, GiBookCover, GiGears } from 'react-icons/gi';
import { FaUserGraduate } from "react-icons/fa";
import ReactECharts from "echarts-for-react";

const learningStyleLabels = [
  'Ativo', 'Reflexivo', 'Teórico', 'Pragmático'
];

const learningStyleExplanations = [
  'Ativo: Prefere aprender fazendo, experimentando e participando ativamente das atividades.',
  'Reflexivo: Prefere observar, refletir e analisar antes de agir.',
  'Teórico: Valoriza conceitos, modelos e análises lógicas para aprender.',
  'Pragmático: Gosta de aplicar ideias na prática e resolver problemas reais.'
];

const learningStyleHowPrefers = [
  'Prefere aprender por meio de atividades práticas, experimentação e participação ativa.',
  'Prefere aprender observando, refletindo e analisando antes de agir.',
  'Prefere aprender por meio de conceitos, modelos, teorias e análises lógicas.',
  'Prefere aprender aplicando ideias na prática e resolvendo problemas reais.'
];

// Ícones para cada estilo de aprendizagem
const learningStyleIcons = [
  GiRunningShoe, // Ativo
  GiThink,       // Reflexivo
  GiBookCover,   // Teórico
  GiGears        // Pragmático
];

const baseChartOption = {
  tooltip: {},
  xAxis: { type: 'value', max: 100 },
  yAxis: {
    type: 'category',
    data: learningStyleLabels,
    axisLabel: {
      width: 180,
      formatter: value => value.length > 18 ? value.match(/.{1,18}/g).join('\n') : value
    }
  },
  series: [{
    name: 'Média',
    type: 'bar',
    data: Array(4).fill(0),
    itemStyle: { color: '#2980b9' },
    barCategoryGap: '30%'
  }],
  grid: { left: 130, right: 40, top: 40, bottom: 40 }
};

// Função utilitária para sugerir agrupamentos por estilo predominante
function sugerirAgrupamentosPorEstilo(students) {
  // students: [{ name, percentages: [..] }]
  if (!students || students.length === 0) return [];
  // Descobre o(s) estilo(s) predominante(s) de cada aluno
  const alunosPorEstilo = [[], [], [], []]; // Ativo, Reflexivo, Teórico, Pragmático
  students.forEach(aluno => {
    if (!aluno || !Array.isArray(aluno.percentages)) return;
    const max = Math.max(...aluno.percentages);
    aluno.percentages.forEach((v, idx) => {
      if (v === max && alunosPorEstilo[idx]) {
        alunosPorEstilo[idx].push(aluno);
      }
    });
  });
  // Cria sugestões de grupos para cada estilo
  const sugestoes = alunosPorEstilo.map((grupo, idx) => ({
    estilo: learningStyleLabels[idx],
    alunos: grupo.map(a => a.name),
    count: grupo.length
  })).filter(g => g.count > 1); // Só sugere grupos com mais de 1 aluno
  return sugestoes;
}

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]); // [{ id, className, students: [{ id, name, avg }] }]
  const [expandedCards, setExpandedCards] = useState({}); // { [classId]: boolean }
  const [studentModal, setStudentModal] = useState({ open: false, student: null, texts: [], grades: [], intelligence: null });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Busca as turmas do professor, cada uma com alunos e média (class_user.avg)
        const res = await api.get("/dashboard/teacher-classes");
        setClasses(res.data.classes || []);
      } catch (e) {
        setClasses([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleStudentClick(student, turma) {
    try {
      // Busca detalhes da turma para pegar as leituras e notas do aluno
      const res = await api.get(`/classes/${turma.id}`);
      const classroom = res.data.classroom;
      const texts = classroom.texts || [];
      const turmaStudent = (classroom.students || []).find(s => s.id === student.id);
      let grades = [];
      if (turmaStudent && Array.isArray(turmaStudent.performances)) {
        grades = texts.map(text => {
          const perf = turmaStudent.performances.find(p => p.text.id === text.id);
          return {
            textName: text.name,
            grade: perf ? perf.grade : null
          };
        });
      }
      // Busca inteligências múltiplas do aluno
      let intelligence = null;
      try {
        const res2 = await api.get(`/users/${student.id}/intelligence`);
        intelligence = res2.data?.result?.percentages || null;
      } catch {}
      // Busca estilos de aprendizagem do aluno
      let learningStyles = null;
      try {
        const res3 = await api.get(`/learning_preferences/${student.id}`);
        learningStyles = res3.data?.result?.percentages || null;
      } catch {}
      setStudentModal({ open: true, student: { ...student, learningStyles }, texts, grades, intelligence });
    } catch {
      setStudentModal({ open: true, student, texts: [], grades: [], intelligence: null });
    }
  }

  return (
    <Container>
      <Header />
      <div style={{ padding: 24 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaUserGraduate color="#2980b9" /> Dashboard do Professor
        </h1>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            {classes.length === 0 ? (
              <p>Nenhuma turma encontrada.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                {classes.map((turma, idx) => (
                  <div key={turma.id || idx} style={{
                    background: '#f6f8fa',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(41,128,185,0.08)',
                    padding: 24,
                    minWidth: 320,
                    flex: '1 1 350px',
                    maxWidth: 420
                  }}>
                    <h2 style={{ color: '#2980b9', marginBottom: 8 }}>{turma.className}</h2>
                    {/* Média geral da turma */}
                    <div style={{ color: '#444', fontWeight: 500, marginBottom: 8, fontSize: 16 }}>
                      Média geral: {turma.students && turma.students.length > 0 ? (
                        (turma.students.reduce((acc, s) => acc + (typeof s.avg === 'number' ? s.avg : 0), 0) / turma.students.length).toFixed(2)
                      ) : '-'}
                    </div>
                    {/* Botão de ordenação */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                      <select
                        value={turma.sortOrder || 'az'}
                        onChange={e => {
                          const order = e.target.value;
                          setClasses(prev => prev.map((t, i) => {
                            if ((t.id || i) !== (turma.id || idx)) return t;
                            const sorted = [...t.students].sort((a, b) => {
                              if (order === 'az') return a.name.localeCompare(b.name);
                              if (order === 'za') return b.name.localeCompare(a.name);
                              if (order === 'media') return (b.avg ?? 0) - (a.avg ?? 0);
                              return 0;
                            });
                            return { ...t, students: sorted, sortOrder: order };
                          }));
                        }}
                        style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                      >
                        <option value="az">A-Z</option>
                        <option value="za">Z-A</option>
                        <option value="media">Maior média</option>
                      </select>
                    </div>
                    {/* Lista de alunos */}
                    {(!turma.students || turma.students.length === 0) ? (
                      <p style={{ color: '#888' }}>Nenhum aluno nesta turma.</p>
                    ) : (
                      <>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Aluno</th>
                              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Média</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(expandedCards[turma.id] === true ? turma.students : turma.students.slice(0, 10)).map((aluno) => (
                              <tr key={aluno.id} style={{ cursor: 'pointer' }} onClick={() => handleStudentClick(aluno, turma)}>
                                <td style={{ padding: 8 }}>{aluno.name}</td>
                                <td style={{ padding: 8 }}>{aluno.avg !== undefined && aluno.avg !== null ? Number(aluno.avg).toFixed(2) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {turma.students.length > 10 && (
                          <div style={{ textAlign: 'center', marginTop: 8 }}>
                            <button
                              style={{
                                background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8,
                                padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(41,128,185,0.08)'
                              }}
                              onClick={() => {
                                const newState = {};
                                classes.forEach((t, i) => {
                                  newState[t.id || i] = !(expandedCards[turma.id || idx] ?? false);
                                });
                                setExpandedCards(newState);
                              }}
                            >
                              {expandedCards[turma.id || idx] ? 'Mostrar menos' : 'Expandir lista'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de notas do aluno */}
      <Modal
        isOpen={studentModal.open}
        onRequestClose={() => setStudentModal({ ...studentModal, open: false })}
        contentLabel="Notas do aluno"
        style={{
          content: {
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)', borderRadius: 20,
            backgroundColor: '#FFF', width: 700, minHeight: 300,
            maxWidth: '98vw', padding: 40, overflow: 'auto'
          }
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Notas de {studentModal.student?.name}</h2>
        {/* Tabela de notas */}
        {studentModal.grades.length === 0 ? (
          <p>Nenhuma leitura encontrada para este aluno nesta turma.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Leitura</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Nota</th>
              </tr>
            </thead>
            <tbody>
              {studentModal.grades.map((g, i) => (
                <tr key={i}>
                  <td style={{ padding: 8 }}>{g.textName}</td>
                  <td style={{ padding: 8 }}>{g.grade !== null && g.grade !== undefined ? Number(g.grade).toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Radar de inteligências múltiplas */}
        {studentModal.intelligence && (
          <div style={{ margin: '48px 0 0 0' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2980b9', textAlign: 'center' }}>Inteligências Múltiplas</h3>
            <ReactECharts
              option={{
                tooltip: {},
                radar: {
                  indicator: [
                    { name: 'Lógico-matemática', max: 100 },
                    { name: 'Linguística', max: 100 },
                    { name: 'Espacial', max: 100 },
                    { name: 'Corporal', max: 100 },
                    { name: 'Musical', max: 100 },
                    { name: 'Interpessoal', max: 100 },
                    { name: 'Intrapessoal', max: 100 },
                    { name: 'Naturalista', max: 100 },
                  ],
                  radius: 90
                },
                series: [{
                  name: 'Inteligências Múltiplas',
                  type: 'radar',
                  data: [
                    {
                      value: studentModal.intelligence.map(v => Number(v)),
                      name: 'Inteligências',
                      areaStyle: { color: 'rgba(41,128,185,0.2)' },
                      lineStyle: { color: '#2980b9' },
                      symbol: 'circle',
                      itemStyle: { color: '#2980b9' }
                    }
                  ]
                }]
              }}
              style={{ height: 260, width: '100%' }}
            />
            {/* Inteligência predominante */}
            <div style={{ marginTop: 8, fontWeight: 500, color: '#2980b9', textAlign: 'center' }}>
              Inteligência predominante: {(() => {
                const idx = studentModal.intelligence.findIndex(v => v === Math.max(...studentModal.intelligence));
                const labels = [
                  'Lógico-matemática', 'Linguística', 'Espacial', 'Corporal',
                  'Musical', 'Interpessoal', 'Intrapessoal', 'Naturalista'
                ];
                return idx !== -1 ? labels[idx] : '-';
              })()}
            </div>
          </div>
        )}
        {/* Radar de estilos de aprendizagem */}
        {studentModal.student?.learningStyles && Array.isArray(studentModal.student.learningStyles) && (
          <div style={{ margin: '48px 0 0 0' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#27ae60', textAlign: 'center' }}>Estilos de Aprendizagem</h3>
            <ReactECharts
              option={{
                tooltip: {},
                radar: {
                  indicator: [
                    { name: 'Ativo', max: 100 },
                    { name: 'Reflexivo', max: 100 },
                    { name: 'Teórico', max: 100 },
                    { name: 'Pragmático', max: 100 },
                  ],
                  radius: 90
                },
                series: [{
                  name: 'Estilos de Aprendizagem',
                  type: 'radar',
                  data: [
                    {
                      value: studentModal.student.learningStyles.map(v => Number(v)),
                      name: 'Estilos',
                      areaStyle: { color: 'rgba(39,174,96,0.2)' },
                      lineStyle: { color: '#27ae60' },
                      symbol: 'circle',
                      itemStyle: { color: '#27ae60' }
                    }
                  ]
                }]
              }}
              style={{ height: 260, width: '100%' }}
            />
            {/* Estilo predominante */}
            <div style={{ marginTop: 8, fontWeight: 500, color: '#27ae60', textAlign: 'center' }}>
              Estilo predominante: {(() => {
                const arr = studentModal.student.learningStyles;
                const idx = arr.findIndex(v => v === Math.max(...arr));
                const labels = ['Ativo', 'Reflexivo', 'Teórico', 'Pragmático'];
                return idx !== -1 ? labels[idx] : '-';
              })()}
            </div>
          </div>
        )}
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <button onClick={() => setStudentModal({ ...studentModal, open: false })} style={{ padding: '8px 24px', borderRadius: 8, background: '#2980b9', color: '#fff', border: 'none', fontWeight: 'bold' }}>Fechar</button>
        </div>
      </Modal>
    </Container>
  );
};

export default TeacherDashboard;

/*
  Comentários:
  - O componente exibe o dashboard do professor, listando suas turmas e, para cada turma, os alunos e suas médias.
  - Inclui carregamento, mensagem para ausência de turmas/alunos e um visual limpo.
  - Código simplificado: removidos estados e funções não utilizados, comentários explicativos.
*/

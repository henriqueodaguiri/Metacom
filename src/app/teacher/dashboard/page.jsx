"use client";
import { useState, useEffect } from "react";
import { Container } from "./styles";
import { Header } from "@/components/Header";
import { api } from "@/lib/api";
import './styles.css';
import Modal from "react-modal";
import { FaQuestionCircle, FaBook, FaUsers } from "react-icons/fa";
import { GiRunningShoe, GiThink, GiBookCover, GiGears } from 'react-icons/gi';
import { FaUserGraduate } from "react-icons/fa";
import ReactECharts from "echarts-for-react";
import * as XLSX from "xlsx";

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

// Função utilitária para exportar dados para XLSX
function exportToXLSX(data, columns, filename) {
  const wsData = [columns.map(col => col.label)];
  data.forEach(row => {
    wsData.push(columns.map(col => typeof col.value === 'function' ? col.value(row) : row[col.value]));
  });
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filename);
}

// Função para exportar alunos de uma turma para XLSX
function exportTurmaToXLSX(turma) {
  const wsData = [
    ['Aluno', 'Média'],
    ...turma.students.map(aluno => [aluno.name, aluno.avg !== undefined && aluno.avg !== null ? Number(aluno.avg).toFixed(2) : '-'])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, turma.className || 'Turma');
  XLSX.writeFile(wb, `turma_${turma.className || turma.id}.xlsx`);
}

// Função para exportar alunos de uma leitura para XLSX
function exportLeituraToXLSX(text) {
  const wsData = [
    ['Aluno', 'Turma', 'Nota'],
    ...text.students.map(aluno => [aluno.name, aluno.className || '-', aluno.grade !== undefined && aluno.grade !== null ? Number(aluno.grade).toFixed(2) : '-'])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, text.name || 'Leitura');
  XLSX.writeFile(wb, `leitura_${text.name || text.id}.xlsx`);
}

// Função para exportar todos os alunos para XLSX
function exportTodosAlunosToXLSX(students) {
  const wsData = [
    ['Aluno', 'Turmas', 'Inteligência predominante', 'Estilo predominante', 'Leituras respondidas', 'Média das leituras cumpridas'],
    ...students.map(aluno => [
      aluno.name,
      aluno.turmas && aluno.turmas.length > 0 ? aluno.turmas.join(", ") : '-',
      aluno.inteligenciaPredominante || '-',
      aluno.estiloPredominante || '-',
      `${aluno.leiturasRespondidas}/${aluno.totalLeituras !== undefined ? aluno.totalLeituras : '?'}`,
      aluno.mediaLeituras !== null ? aluno.mediaLeituras : '-'
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'TodosAlunos');
  XLSX.writeFile(wb, 'todos_alunos.xlsx');
}

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]); // [{ id, className, students: [{ id, name, avg }] }]
  const [expandedCards, setExpandedCards] = useState({}); // { [classId]: boolean }
  const [studentModal, setStudentModal] = useState({ open: false, student: null, texts: [], grades: [], intelligence: null });
  const [texts, setTexts] = useState([]); // [{ id, name, students: [{ id, name, grade }] }]
  const [expandedTextCards, setExpandedTextCards] = useState({});
  const [studentTextModal, setStudentTextModal] = useState({ open: false, student: null, text: null, questions: [], intelligence: null });
  const [showQuestions, setShowQuestions] = useState({}); // { [textId]: boolean }

  // Paginação para alunos das turmas
  const [studentsPage, setStudentsPage] = useState({}); // { [classId]: page }
  const studentsPerPage = 10;
  // Paginação para alunos das leituras
  const [textStudentsPage, setTextStudentsPage] = useState({}); // { [textId]: page }
  const textStudentsPerPage = 10;
  const [studentsSummary, setStudentsSummary] = useState([]);
  // Paginação para todos os alunos
  const [studentsSummaryPage, setStudentsSummaryPage] = useState(0);
  const studentsSummaryPerPage = 10;
  // Novo estado para modal de detalhes do aluno do resumo
  const [studentSummaryModal, setStudentSummaryModal] = useState({ open: false, student: null, intelligence: null, learningStyles: null });
  const [studentsSummarySort, setStudentsSummarySort] = useState('az');

  // Filtros para cada coluna da lista de todos os alunos
  const [studentsSummaryFilters, setStudentsSummaryFilters] = useState({
    name: '',
    turmas: '',
    inteligencia: '',
    estilo: '',
    leituras: '',
    media: ''
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Busca as turmas do professor, cada uma com alunos e média (class_user.avg)
        const res = await api.get("/dashboard/teacher-classes");
        setClasses(res.data.classes || []);
        // Busca todos os textos do professor com alunos e notas (endpoint correto)
        const resTexts = await api.get("/dashboard/teacher-texts");
        setTexts(resTexts.data.texts || []);
        // Busca resumo de todos os alunos
        const resSummary = await api.get("/dashboard/teacher-students-summary");
        setStudentsSummary(resSummary.data.students || []);
      } catch (e) {
        setClasses([]);
        setTexts([]);
        setStudentsSummary([]);
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

  async function handleStudentTextClick(student, text) {
    try {
      // Busca detalhes do texto e respostas do aluno
      const res = await api.get(`/classText/${student.classId}/${text.id}?studentId=${student.id}`);
      const classText = res.data.classText;
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
      setStudentTextModal({ open: true, student: { ...student, learningStyles }, text, questions: classText.questions, intelligence });
    } catch {
      setStudentTextModal({ open: true, student, text, questions: [], intelligence: null });
    }
  }

  // Função para abrir modal de detalhes do aluno do resumo
  async function handleStudentSummaryClick(aluno) {
    setLoading(true);
    try {
      // Busca email do aluno
      let email = '-';
      try {
        const resUser = await api.get(`/users/${aluno.id}`);
        // Tenta pegar email em diferentes formatos possíveis e loga a resposta para debug
        console.log('DEBUG_USER_RES', resUser.data);
        if (resUser.data?.user?.email) email = resUser.data.user.email;
        else if (resUser.data?.email) email = resUser.data.email;
        else if (resUser.data?.result?.email) email = resUser.data.result.email;
        else if (typeof resUser.data === 'string' && resUser.data.includes('@')) email = resUser.data;
      } catch (e) {
        // Se erro 404, mostra mensagem amigável
        if (e?.response?.status === 404) {
          alert('Usuário não encontrado na API /users/' + aluno.id + '. Verifique se o endpoint existe e retorna o email.');
        } else {
          console.log('DEBUG_USER_EMAIL_ERROR', e);
        }
      }
      // Busca inteligências múltiplas
      let intelligence = null;
      try {
        const res2 = await api.get(`/users/${aluno.id}/intelligence`);
        if (Array.isArray(res2.data?.result?.percentages)) {
          intelligence = res2.data.result.percentages;
        } else if (typeof res2.data?.result?.percentages === 'object' && res2.data?.result?.percentages !== null) {
          intelligence = Object.values(res2.data.result.percentages).map(Number);
        }
      } catch {}
      // Busca estilos de aprendizagem
      let learningStyles = null;
      try {
        const res3 = await api.get(`/learning_preferences/${aluno.id}`);
        if (Array.isArray(res3.data?.result?.percentages)) {
          learningStyles = res3.data.result.percentages;
        } else if (typeof res3.data?.result?.percentages === 'object' && res3.data?.result?.percentages !== null) {
          learningStyles = Object.values(res3.data.result.percentages).map(Number);
        }
      } catch {}
      setStudentSummaryModal({ open: true, student: { ...aluno, email }, intelligence, learningStyles });
    } catch {
      setStudentSummaryModal({ open: true, student: { ...aluno, email: '-' }, intelligence: null, learningStyles: null });
    }
    setLoading(false);
  }

  // Função para aplicar filtros
  const filteredStudentsSummary = studentsSummary.filter(aluno => {
    const nameMatch = studentsSummaryFilters.name === '' || aluno.name.toLowerCase().includes(studentsSummaryFilters.name.toLowerCase());
    const turmaMatch = studentsSummaryFilters.turmas === '' || (aluno.turmas && aluno.turmas.join(',').toLowerCase().includes(studentsSummaryFilters.turmas.toLowerCase()));
    const inteligenciaMatch = studentsSummaryFilters.inteligencia === '' || (aluno.inteligenciaPredominante || '').toLowerCase().includes(studentsSummaryFilters.inteligencia.toLowerCase());
    const estiloMatch = studentsSummaryFilters.estilo === '' || (aluno.estiloPredominante || '').toLowerCase().includes(studentsSummaryFilters.estilo.toLowerCase());
    const leiturasMatch = studentsSummaryFilters.leituras === '' || (`${aluno.leiturasRespondidas}/${aluno.totalLeituras}`).includes(studentsSummaryFilters.leituras);
    const mediaMatch = studentsSummaryFilters.media === '' || (aluno.mediaLeituras !== null && String(aluno.mediaLeituras).includes(studentsSummaryFilters.media));
    return nameMatch && turmaMatch && inteligenciaMatch && estiloMatch && leiturasMatch && mediaMatch;
  });

  return (
    <Container>
      <Header />
      <div style={{ padding: 24 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FaUsers color="#2980b9" /> Turmas
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
                    maxWidth: 420,
                    position: 'relative',
                    paddingBottom: turma.students.length > studentsPerPage ? 80 : 24
                  }}>
                    <h2 style={{ color: '#2980b9', marginBottom: 8 }}>{turma.className}</h2>
                    {/* Média da turma */}
                    <div style={{ color: '#888', fontWeight: 500, marginBottom: 8 }}>
                      <span
                        style={{ textDecoration: 'underline dotted', cursor: 'help' }}
                        title="A média da turma é calculada somando as médias dos alunos e dividindo pelo número de alunos."
                      >
                        Média da turma:
                      </span>
                      {' '}
                      {turma.students && turma.students.length > 0 && turma.students.filter(a => a.avg !== undefined && a.avg !== null).length > 0 ? (
                        (turma.students.reduce((acc, a) => acc + (a.avg !== undefined && a.avg !== null ? Number(a.avg) : 0), 0) / turma.students.filter(a => a.avg !== undefined && a.avg !== null).length).toFixed(2)
                      ) : '-'}
                    </div>
                    {/* Botão exportar XLSX turma e select de ordenação na mesma linha */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <button onClick={() => exportTurmaToXLSX(turma)} style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>Exportar XLSX</button>
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
                              if (order === 'menor') return (a.avg ?? 0) - (b.avg ?? 0);
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
                        <option value="menor">Menor média</option>
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
                            {turma.students.slice((studentsPage[turma.id] || 0) * studentsPerPage, ((studentsPage[turma.id] || 0) + 1) * studentsPerPage).map((aluno) => (
                              <tr key={aluno.id} style={{ cursor: 'pointer' }} onClick={() => handleStudentClick(aluno, turma)}>
                                <td style={{ padding: 8 }}>{aluno.name}</td>
                                <td style={{ padding: 8 }}>{aluno.avg !== undefined && aluno.avg !== null ? Number(aluno.avg).toFixed(2) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {turma.students.length > studentsPerPage && (
                          <div style={{
                            position: 'static', // Corrigido de 'absolute' para 'static'
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 8,
                            zIndex: 2,
                            marginTop: 24
                          }}>
                            <button
                              style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(41,128,185,0.08)' }}
                              disabled={(studentsPage[turma.id] || 0) === 0}
                              onClick={() => setStudentsPage(prev => ({ ...prev, [turma.id]: Math.max(0, (prev[turma.id] || 0) - 1) }))}
                            >Anterior</button>
                            <span style={{ alignSelf: 'center', fontWeight: 500 }}>
                              Página {(studentsPage[turma.id] || 0) + 1} de {Math.ceil(turma.students.length / studentsPerPage)}
                            </span>
                            <button
                              style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(41,128,185,0.08)' }}
                              disabled={((studentsPage[turma.id] || 0) + 1) >= Math.ceil(turma.students.length / studentsPerPage)}
                              onClick={() => setStudentsPage(prev => ({ ...prev, [turma.id]: Math.min(Math.ceil(turma.students.length / studentsPerPage) - 1, (prev[turma.id] || 0) + 1) }))}
                            >Próxima</button>
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
        {/* NOVA SESSÃO: Leituras */}
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 40 }}>
          <FaBook color="#2980b9" /> Leituras
        </h1>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            {texts.length === 0 ? (
              <p>Nenhuma leitura encontrada.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
                {texts.map((text, idx) => (
                  <div key={text.id || idx} style={{
                    background: '#f6f8fa',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(41,128,185,0.08)',
                    padding: 24,
                    minWidth: 320,
                    flex: '1 1 350px',
                    maxWidth: 420,
                    position: 'relative',
                    paddingBottom: text.students.length > textStudentsPerPage ? 80 : 24
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <h2 style={{ color: '#2980b9', margin: 0, marginRight: 8 }}>{text.name}</h2>
                      <button onClick={() => setShowQuestions(prev => ({ ...prev, [text.id || idx]: !prev[text.id || idx] }))} style={{ marginLeft: 'auto', background: '#fff', color: '#2980b9', border: '1px solid #2980b9', borderRadius: 8, padding: '4px 12px', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' }}>Ver perguntas</button>
                    </div>
                    {/* Média da leitura */}
                    <div style={{ color: '#888', fontWeight: 500, marginBottom: 8 }}>
                      <span
                        style={{ textDecoration: 'underline dotted', cursor: 'help' }}
                        title="A média das notas é calculada somando todas as notas dos alunos que responderam à leitura e dividindo pelo número de alunos com nota."
                      >
                        Média das notas:
                      </span>
                      {' '}
                      {text.students && text.students.length > 0 ? (
                        (text.students.reduce((acc, a) => acc + (a.grade !== undefined && a.grade !== null ? Number(a.grade) : 0), 0) / text.students.filter(a => a.grade !== undefined && a.grade !== null).length).toFixed(2)
                      ) : '-'}
                    </div>
                    {/* Botão exportar XLSX leitura e select de ordenação na mesma linha */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <button onClick={() => exportLeituraToXLSX(text)} style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>Exportar XLSX</button>
                      <select
                        value={text.sortOrder || 'az'}
                        onChange={e => {
                          const order = e.target.value;
                          setTeacherTexts(prev => prev.map((t, i) => {
                            if ((t.id || i) !== (text.id || idx)) return t;
                            const sorted = [...t.students].sort((a, b) => {
                              if (order === 'az') return a.name.localeCompare(b.name);
                              if (order === 'za') return b.name.localeCompare(a.name);
                              if (order === 'media') return (b.grade ?? 0) - (a.grade ?? 0);
                              if (order === 'menor') return (a.grade ?? 0) - (b.grade ?? 0);
                              return 0;
                            });
                            return { ...t, students: sorted, sortOrder: order };
                          }));
                        }}
                        style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
                      >
                        <option value="az">A-Z</option>
                        <option value="za">Z-A</option>
                        <option value="media">Maior nota</option>
                        <option value="menor">Menor nota</option>
                      </select>
                    </div>
                    {/* Lista de alunos da leitura */}
                    {showQuestions[text.id || idx] ? (
                      (!text.questions || text.questions.length === 0) ? (
                        <p style={{ color: '#888' }}>Nenhuma pergunta cadastrada para esta leitura.</p>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Pergunta</th>
                              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Acertos</th>
                              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Total respostas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {text.questions.map((q, qi) => {
                              const correctChoice = q.choices.find(c => c.isCorrect);
                              const total = q.answers ? q.answers.length : 0;
                              const acertos = q.answers && correctChoice
                                ? q.answers.filter(a => String(a.choiceId) === String(correctChoice.id)).length
                                : 0;
                              return (
                                <tr key={q.id || qi}>
                                  <td style={{ padding: 8 }}>{q.statement}</td>
                                  <td style={{ padding: 8, color: '#27ae60', fontWeight: 500 }}>{acertos}</td>
                                  <td style={{ padding: 8 }}>{total}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )
                    ) : (
                      // Lista de alunos
                      (!text.students || text.students.length === 0) ? (
                        <p style={{ color: '#888' }}>Nenhum aluno respondeu esta leitura.</p>
                      ) : (
                        <>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Aluno</th>
                                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Turma</th>
                                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Nota</th>
                              </tr>
                            </thead>
                            <tbody>
                              {text.students.slice((textStudentsPage[text.id] || 0) * textStudentsPerPage, ((textStudentsPage[text.id] || 0) + 1) * textStudentsPerPage).map((aluno, i) => (
                                <tr key={aluno.id + '-' + aluno.classId + '-' + i} style={{ cursor: 'pointer' }} onClick={() => handleStudentTextClick(aluno, text)}>
                                  <td style={{ padding: 8 }}>{aluno.name}</td>
                                  <td style={{ padding: 8 }}>{aluno.className || '-'}</td>
                                  <td style={{ padding: 8 }}>{aluno.grade !== undefined && aluno.grade !== null ? Number(aluno.grade).toFixed(2) : '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {text.students.length > textStudentsPerPage && (
                            <div style={{
                              position: 'static', // Corrigido de 'absolute' para 'static'
                              display: 'flex',
                              justifyContent: 'center',
                              gap: 8,
                              zIndex: 2,
                              marginTop: 24
                            }}>
                              <button
                                style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(41,128,185,0.08)' }}
                                disabled={(textStudentsPage[text.id] || 0) === 0}
                                onClick={() => setTextStudentsPage(prev => ({ ...prev, [text.id]: Math.max(0, (prev[text.id] || 0) - 1) }))}
                              >Anterior</button>
                              <span style={{ alignSelf: 'center', fontWeight: 500 }}>
                                Página {(textStudentsPage[text.id] || 0) + 1} de {Math.ceil(text.students.length / textStudentsPerPage)}
                              </span>
                              <button
                                style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(41,128,185,0.08)' }}
                                disabled={((textStudentsPage[text.id] || 0) + 1) >= Math.ceil(text.students.length / textStudentsPerPage)}
                                onClick={() => setTextStudentsPage(prev => ({ ...prev, [text.id]: Math.min(Math.ceil(text.students.length / textStudentsPerPage) - 1, (prev[text.id] || 0) + 1) }))}
                              >Próxima</button>
                            </div>
                          )}
                        </>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {/* NOVA SESSÃO: Todos os Alunos */}
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(41,128,185,0.08)',
            padding: 32,
            marginBottom: 32,
            position: 'relative',
            minWidth: 900,
            maxWidth: '100%',
            overflowX: 'auto',
            marginTop: 40 // Espaçamento extra para separar dos cards acima
          }}>
            {/* Título dentro do card */}
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 0, marginBottom: 24 }}>
              <FaUserGraduate color="#2980b9" /> Todos os Alunos
            </h1>
            {/* Botão exportar XLSX todos os alunos */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => exportTodosAlunosToXLSX(filteredStudentsSummary)} style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', marginRight: 16 }}>Exportar XLSX</button>
              <select
                value={studentsSummarySort || 'az'}
                onChange={e => {
                  const order = e.target.value;
                  setStudentsSummarySort(order);
                  setStudentsSummary(prev => {
                    const sorted = [...prev].sort((a, b) => {
                      if (order === 'az') return a.name.localeCompare(b.name);
                      if (order === 'za') return b.name.localeCompare(a.name);
                      if (order === 'leituras') return (b.leiturasRespondidas ?? 0) - (a.leiturasRespondidas ?? 0);
                      if (order === 'media') return (b.mediaLeituras ?? 0) - (a.mediaLeituras ?? 0);
                      return 0;
                    });
                    return sorted;
                  });
                }}
                style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
                <option value="leituras">Mais leituras respondidas</option>
                <option value="media">Maior média</option>
              </select>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #2980b9', padding: 8 }}>Aluno</th>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #2980b9', padding: 8 }}>Turmas</th>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #2980b9', padding: 8 }}>Inteligência predominante</th>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #2980b9', padding: 8 }}>Estilo predominante</th>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #2980b9', padding: 8 }}>Leituras respondidas</th>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #2980b9', padding: 8 }}>Média das leituras cumpridas</th>
                </tr>
                <tr>
                  <th style={{ padding: 4 }}>
                    <input type="text" value={studentsSummaryFilters.name} onChange={e => setStudentsSummaryFilters(f => ({ ...f, name: e.target.value }))} placeholder="Filtrar..." style={{ width: '95%', borderRadius: 8 }} />
                  </th>
                  <th style={{ padding: 4 }}>
                    <input type="text" value={studentsSummaryFilters.turmas} onChange={e => setStudentsSummaryFilters(f => ({ ...f, turmas: e.target.value }))} placeholder="Filtrar..." style={{ width: '95%', borderRadius: 8 }} />
                  </th>
                  <th style={{ padding: 4 }}>
                    <input type="text" value={studentsSummaryFilters.inteligencia} onChange={e => setStudentsSummaryFilters(f => ({ ...f, inteligencia: e.target.value }))} placeholder="Filtrar..." style={{ width: '95%', borderRadius: 8 }} />
                  </th>
                  <th style={{ padding: 4 }}>
                    <input type="text" value={studentsSummaryFilters.estilo} onChange={e => setStudentsSummaryFilters(f => ({ ...f, estilo: e.target.value }))} placeholder="Filtrar..." style={{ width: '95%', borderRadius: 8 }} />
                  </th>
                  <th style={{ padding: 4 }}>
                    <input type="text" value={studentsSummaryFilters.leituras} onChange={e => setStudentsSummaryFilters(f => ({ ...f, leituras: e.target.value }))} placeholder="Filtrar..." style={{ width: '95%', borderRadius: 8 }} />
                  </th>
                  <th style={{ padding: 4 }}>
                    <input type="text" value={studentsSummaryFilters.media} onChange={e => setStudentsSummaryFilters(f => ({ ...f, media: e.target.value }))} placeholder="Filtrar..." style={{ width: '95%', borderRadius: 8 }} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudentsSummary.slice((studentsSummaryPage || 0) * studentsSummaryPerPage, ((studentsSummaryPage || 0) + 1) * studentsSummaryPerPage).map((aluno, i) => (
                  <tr key={aluno.id} style={{ cursor: 'pointer' }} onClick={() => handleStudentSummaryClick(aluno)}>
                    <td style={{ padding: 8 }}>{aluno.name}</td>
                    <td style={{ padding: 8 }}>{aluno.turmas && aluno.turmas.length > 0 ? aluno.turmas.join(", ") : '-'}</td>
                    <td style={{ padding: 8 }}>{aluno.inteligenciaPredominante || '-'}</td>
                    <td style={{ padding: 8 }}>{aluno.estiloPredominante || '-'}</td>
                    <td style={{ padding: 8 }}>
                      {aluno.leiturasRespondidas}/{aluno.totalLeituras !== undefined ? aluno.totalLeituras : '?'}
                    </td>
                    <td style={{ padding: 8 }}>{aluno.mediaLeituras !== null ? aluno.mediaLeituras : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Paginação */}
            {studentsSummary.length > studentsSummaryPerPage && (
              <div style={{
                position: 'static', // Corrigido de 'absolute' para 'static' para não sobrepor modais
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                zIndex: 2,
                marginTop: 24 // Espaço extra para separar da tabela
              }}>
                <button
                  style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(41,128,185,0.08)' }}
                  disabled={(studentsSummaryPage || 0) === 0}
                  onClick={() => setStudentsSummaryPage(Math.max(0, (studentsSummaryPage || 0) - 1))}
                >Anterior</button>
                <span style={{ alignSelf: 'center', fontWeight: 500 }}>
                  Página {(studentsSummaryPage || 0) + 1} de {Math.ceil(studentsSummary.length / studentsSummaryPerPage)}
                </span>
                <button
                  style={{ background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 18px', fontWeight: 'bold', fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(41,128,185,0.08)' }}
                  disabled={((studentsSummaryPage || 0) + 1) >= Math.ceil(studentsSummary.length / studentsSummaryPerPage)}
                  onClick={() => setStudentsSummaryPage(Math.min(Math.ceil(studentsSummary.length / studentsSummaryPerPage) - 1, (studentsSummaryPage || 0) + 1))}
                >Próxima</button>
              </div>
            )}
          </div>
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
                    { name: 'Lógico-matematica', max: 100 },
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
                  'Lógico-matematica', 'Linguística', 'Espacial', 'Corporal',
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
      {/* Modal detalhado do aluno para leitura */}
      <Modal
        isOpen={studentTextModal.open}
        onRequestClose={() => setStudentTextModal({ ...studentTextModal, open: false })}
        contentLabel="Detalhes do aluno na leitura"
        style={{
          content: {
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)', borderRadius: 20,
            backgroundColor: '#FFF', width: 700, minHeight: 300,
            maxWidth: '98vw', padding: 40, overflow: 'auto'
          }
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Desempenho de {studentTextModal.student?.name} em "{studentTextModal.text?.name}"</h2>
        {/* Tabela de perguntas */}
        {studentTextModal.questions.length === 0 ? (
          <p>Nenhuma resposta encontrada para este aluno nesta leitura.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Pergunta</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Acertou?</th>
              </tr>
            </thead>
            <tbody>
              {studentTextModal.questions.map((q, i) => {
                const correctChoice = q.choices.find(c => c.isCorrect);
                // LOG DETALHADO: Mostra todos os campos e valores da pergunta para identificar onde está a resposta do aluno
                if (typeof window !== 'undefined') {
                  Object.entries(q).forEach(([k, v]) => {
                    console.log('Q_FIELD', k, v);
                  });
                  console.log('Q_FULL', q);
                }
                let selectedId = null;
                if (q.selectedChoiceId !== undefined && q.selectedChoiceId !== null) {
                  selectedId = q.selectedChoiceId;
                } else if (q.selectedChoice && q.selectedChoice.id !== undefined && q.selectedChoice.id !== null) {
                  selectedId = q.selectedChoice.id;
                } else if (q.answerId !== undefined && q.answerId !== null) {
                  selectedId = q.answerId;
                } else if (q.answer && q.answer.id !== undefined && q.answer.id !== null) {
                  selectedId = q.answer.id;
                } else if (q.selectedChoice && typeof q.selectedChoice === 'number') {
                  selectedId = q.selectedChoice;
                } else if (q.selectedChoice && typeof q.selectedChoice === 'string') {
                  selectedId = q.selectedChoice;
                }
                let acertou = false;
                if (correctChoice && selectedId !== null) {
                  acertou = String(selectedId) === String(correctChoice.id);
                }
                let resposta = '-';
                if (selectedId === null) {
                  resposta = 'Não respondida';
                } else {
                  resposta = acertou ? 'Sim' : 'Não';
                }
                return (
                  <tr key={i}>
                    <td style={{ padding: 8 }}>{q.statement}</td>
                    <td style={{ padding: 8, color: acertou ? '#27ae60' : (selectedId === null ? '#888' : '#c0392b'), fontWeight: 500 }}>{resposta}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {/* Radar de inteligências múltiplas */}
        {studentTextModal.intelligence && (
          <div style={{ margin: '48px 0 0 0' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#2980b9', textAlign: 'center' }}>Inteligências Múltiplas</h3>
            <ReactECharts
              option={{
                tooltip: {},
                radar: {
                  indicator: [
                    { name: 'Lógico-matematica', max: 100 },
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
                      value: studentTextModal.intelligence.map(v => Number(v)),
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
                const idx = studentTextModal.intelligence.findIndex(v => v === Math.max(...studentTextModal.intelligence));
                const labels = [
                  'Lógico-matematica', 'Linguística', 'Espacial', 'Corporal',
                  'Musical', 'Interpessoal', 'Intrapessoal', 'Naturalista'
                ];
                return idx !== -1 ? labels[idx] : '-';
              })()}
            </div>
          </div>
        )}
        {/* Radar de estilos de aprendizagem */}
        {studentTextModal.student?.learningStyles && Array.isArray(studentTextModal.student.learningStyles) && (
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
                      value: studentTextModal.student.learningStyles.map(v => Number(v)),
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
                const arr = studentTextModal.student.learningStyles;
                const idx = arr.findIndex(v => v === Math.max(...arr));
                const labels = ['Ativo', 'Reflexivo', 'Teórico', 'Pragmático'];
                return idx !== -1 ? labels[idx] : '-';
              })()}
            </div>
          </div>
        )}
        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <button onClick={() => setStudentTextModal({ ...studentTextModal, open: false })} style={{ padding: '8px 24px', borderRadius: 8, background: '#2980b9', color: '#fff', border: 'none', fontWeight: 'bold' }}>Fechar</button>
        </div>
      </Modal>
      {/* Modal de detalhes do aluno do resumo */}
      <Modal
        isOpen={studentSummaryModal.open}
        onRequestClose={() => setStudentSummaryModal({ ...studentSummaryModal, open: false })}
        contentLabel="Detalhes do aluno"
        style={{
          content: {
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)', borderRadius: 20,
            backgroundColor: '#FFF', width: 700, minHeight: 300,
            maxWidth: '98vw', padding: 40, overflow: 'auto'
          }
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Dados do Aluno</h2>
        {studentSummaryModal.student && (
          <>
            <div style={{ marginBottom: 16 }}>
              <strong>Nome:</strong> {studentSummaryModal.student.name}<br />
              <strong>Email:</strong> {studentSummaryModal.student.email}
            </div>
            {/* Radar de inteligências múltiplas */}
            {studentSummaryModal.intelligence && Array.isArray(studentSummaryModal.intelligence) && studentSummaryModal.intelligence.length === 8 && (
              <div style={{ margin: '32px 0 0 0' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#2980b9', textAlign: 'center' }}>Inteligências Múltiplas</h3>
                <ReactECharts
                  option={{
                    tooltip: {},
                    radar: {
                      indicator: [
                        { name: 'Lógico-matematica', max: 100 },
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
                          value: studentSummaryModal.intelligence.map(v => Number(v)),
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
              </div>
            )}
            {/* Radar de estilos de aprendizagem */}
            {studentSummaryModal.learningStyles && Array.isArray(studentSummaryModal.learningStyles) && studentSummaryModal.learningStyles.length === 4 && (
              <div style={{ margin: '32px 0 0 0' }}>
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
                          value: studentSummaryModal.learningStyles.map(v => Number(v)),
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
              </div>
            )}
            <div style={{ textAlign: 'right', marginTop: 32, display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <button
                onClick={async () => {
                  if (!studentSummaryModal.student?.id) return;
                  if (!window.confirm('Tem certeza que deseja excluir este aluno de todas as suas turmas? Essa ação não pode ser desfeita.')) return;
                  try {
                    // Chama endpoint para remover o aluno de todas as turmas do professor
                    await api.delete(`/dashboard/teacher-remove-student/${studentSummaryModal.student.id}`);
                    alert('Aluno removido de todas as suas turmas com sucesso!');
                    setStudentSummaryModal({ ...studentSummaryModal, open: false });
                    // Atualiza lista de alunos
                    const resSummary = await api.get('/dashboard/teacher-students-summary');
                    setStudentsSummary(resSummary.data.students || []);
                  } catch (e) {
                    alert('Erro ao remover aluno: ' + (e?.response?.data?.message || e.message || e));
                  }
                }}
                style={{ padding: '8px 24px', borderRadius: 8, background: '#c0392b', color: '#fff', border: 'none', fontWeight: 'bold' }}
                disabled={!studentSummaryModal.student.id}
              >Excluir Aluno</button>
              <button
                onClick={() => window.open(`mailto:${studentSummaryModal.student.email}`)}
                style={{ padding: '8px 24px', borderRadius: 8, background: '#27ae60', color: '#fff', border: 'none', fontWeight: 'bold' }}
                disabled={!studentSummaryModal.student.email || studentSummaryModal.student.email === '-'}
              >Enviar Email</button>
              <button
                onClick={() => setStudentSummaryModal({ ...studentSummaryModal, open: false })}
                style={{ padding: '8px 24px', borderRadius: 8, background: '#2980b9', color: '#fff', border: 'none', fontWeight: 'bold' }}
              >Fechar</button>
            </div>
          </>
        )}
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

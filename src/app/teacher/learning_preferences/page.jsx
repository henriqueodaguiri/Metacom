"use client";
import { useState, useEffect } from "react";
import { Container } from "./styles";
import { Header } from "@/components/Header";
import ReactECharts from "echarts-for-react";
import { api } from "@/lib/api";
import './styles.css';
import Modal from "react-modal";
import { FaQuestionCircle } from "react-icons/fa";
import { GiRunningShoe, GiThink, GiBookCover, GiGears } from 'react-icons/gi';

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

const LearningPreferencesDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [studentsAvg, setStudentsAvg] = useState(Array(4).fill(0));
  const [classAverages, setClassAverages] = useState([]); // [{ className, avg: [..] }]
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ className: '', styleIdx: 0, students: [] });
  const [allStudents, setAllStudents] = useState([]);
  // Novo estado para modal do gráfico de pizza
  const [pizzaModal, setPizzaModal] = useState({ open: false, styleIdx: 0, alunos: [] });
  // Estado para feedback de criação de turma
  const [createClassFeedback, setCreateClassFeedback] = useState({ msg: '', success: null });
  const [styleInfoModal, setStyleInfoModal] = useState({ open: false, idx: 0 });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await api.get("/learning/teacher-stats?type=preferences");
        setStudentsAvg(res.data.studentsAvg || Array(4).fill(0));
        setClassAverages(res.data.classes || []);
        setAllStudents(res.data.allStudents || []);
      } catch (e) {
        setStudentsAvg(Array(4).fill(0));
        setClassAverages([]);
        setAllStudents([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Handler para abrir modal ao clicar na barra
  const handleBarClick = async (params, turma) => {
    const styleIdx = params.dataIndex;
    try {
      const res = await api.get(`/classes/${turma.id}/students-learning-preferences?styleIdx=${styleIdx}`);
      setModalData({
        className: turma.name,
        styleIdx,
        students: res.data.students || []
      });
      setModalOpen(true);
    } catch {
      setModalData({ className: turma.name, styleIdx, students: [] });
      setModalOpen(true);
    }
  };

  // Exemplo de uso das sugestões no dashboard global (fora do map de turmas):
  const agrupamentosPorEstilo = sugerirAgrupamentosPorEstilo(allStudents).filter(grupo => {
    // Para cada sugestão, verifica se já existe uma turma com exatamente os mesmos alunos
    const grupoAlunosSet = new Set(grupo.alunos);
    return !classAverages.some(cls => {
      const turmaAlunos = (cls.students || []);
      if (turmaAlunos.length !== grupo.alunos.length) return false;
      // Verifica se todos os alunos do grupo estão na turma e vice-versa
      return turmaAlunos.every(a => grupoAlunosSet.has(a)) && grupoAlunosSet.size === turmaAlunos.length;
    });
  });

  // Gráfico de pizza: considerar todos os alunos do professor, não só os agrupamentos sugeridos
  const alunosPorEstilo = [[], [], [], []]; // Ativo, Reflexivo, Teórico, Pragmático
  allStudents.forEach(aluno => {
    if (!aluno || !Array.isArray(aluno.percentages)) return;
    const max = Math.max(...aluno.percentages);
    aluno.percentages.forEach((v, idx) => {
      if (v === max && alunosPorEstilo[idx]) {
        alunosPorEstilo[idx].push(aluno);
      }
    });
  });
  const pizzaData = alunosPorEstilo.map((grupo, idx) => ({ value: grupo.length, name: learningStyleLabels[idx] }));

  return (
    <Container>
      <Header />
      <div style={{ padding: 24 }}>
        {/* Botão de explicação sobre estilos de aprendizagem */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 16px 0' }}>
          <button
            onClick={() => setStyleInfoModal({ open: true, idx: -1 })}
            style={{
              background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 28px', fontWeight: 'bold', fontSize: 17, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(41,128,185,0.08)', marginBottom: 8
            }}
          >
            O que são os Estilos de Aprendizagem?
          </button>
        </div>
        {/* Card de ícones dos estilos de aprendizagem */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 24,
          margin: '0 0 32px 0',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {learningStyleLabels.map((label, idx) => {
            const Icon = learningStyleIcons[idx];
            return (
              <div
                key={idx}
                style={{
                  background: '#f6f8fa',
                  borderRadius: 16,
                  boxShadow: '0 2px 8px rgba(41,128,185,0.08)',
                  padding: 24,
                  minWidth: 160,
                  minHeight: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onClick={() => setStyleInfoModal({ open: true, idx })}
                title={label}
              >
                <Icon size={48} color={['#2980b9', '#16a085', '#e67e22', '#c0392b'][idx]} />
                <span style={{ marginTop: 16, fontWeight: 'bold', fontSize: 18, color: '#444', textAlign: 'center' }}>{label}</span>
              </div>
            );
          })}
        </div>
        {/* Título movido para baixo dos cards */}
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Estatísticas dos Estilos de Aprendizagem (Honey-Alonso)
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <FaQuestionCircle style={{ color: '#2980b9', cursor: 'pointer' }} title="Cada gráfico mostra a média dos estilos de aprendizagem dos alunos de cada turma, segundo o questionário de Honey-Alonso." />
          </span>
        </h1>
        {/* Modal de explicação dos estilos de aprendizagem */}
        <Modal
          isOpen={styleInfoModal.open}
          onRequestClose={() => setStyleInfoModal({ ...styleInfoModal, open: false })}
          contentLabel="Sobre o estilo de aprendizagem"
          style={{
            content: {
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)', borderRadius: 20,
              backgroundColor: '#FFF', width: 500, minHeight: 200,
              maxWidth: '95vw', padding: 32, overflow: 'auto'
            }
          }}
        >
          {styleInfoModal.idx === -1 ? (
            <>
              <h2 style={{ marginTop: 0 }}>O que são os Estilos de Aprendizagem?</h2>
              <div style={{ fontSize: 17, color: '#444', marginBottom: 16 }}>
                Os estilos de aprendizagem, segundo o modelo de Honey-Alonso, representam diferentes maneiras pelas quais as pessoas preferem aprender e processar informações. <br /><br />
                Os quatro estilos principais são: Ativo, Reflexivo, Teórico e Pragmático. Cada pessoa pode apresentar predominância em um ou mais desses estilos, o que influencia como ela se envolve, compreende e retém novos conhecimentos.<br /><br />
                Conhecer o estilo de aprendizagem dos alunos permite ao professor diversificar estratégias e tornar o ensino mais eficaz e personalizado.
              </div>
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => setStyleInfoModal({ ...styleInfoModal, open: false })} style={{ padding: '8px 24px', borderRadius: 8, background: '#2980b9', color: '#fff', border: 'none', fontWeight: 'bold' }}>Fechar</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                {(() => {
                  const Icon = learningStyleIcons[styleInfoModal.idx];
                  return <Icon size={40} color={['#2980b9', '#16a085', '#e67e22', '#c0392b'][styleInfoModal.idx]} />;
                })()}
                <h2 style={{ margin: 0 }}>{learningStyleLabels[styleInfoModal.idx]}</h2>
              </div>
              <div style={{ fontSize: 17, color: '#444', marginBottom: 16 }}>
                {learningStyleExplanations[styleInfoModal.idx]}
                <br /><br />
                <span style={{ color: '#2980b9', fontStyle: 'italic' }}>{learningStyleHowPrefers[styleInfoModal.idx]}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => setStyleInfoModal({ ...styleInfoModal, open: false })} style={{ padding: '8px 24px', borderRadius: 8, background: '#2980b9', color: '#fff', border: 'none', fontWeight: 'bold' }}>Fechar</button>
              </div>
            </>
          )}
        </Modal>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            {classAverages.length === 0 && (
              <>
                <p>Nenhuma turma encontrada.</p>
                <pre style={{ background: '#eee', padding: 8 }}>{JSON.stringify({ studentsAvg, classAverages }, null, 2)}</pre>
              </>
            )}
            {/* Gráficos das turmas */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'stretch', justifyContent: 'flex-start' }}>
              {classAverages.map((cls, idx) => (
                <div key={idx} style={{ flex: '1 1 48%', maxWidth: '48%', minWidth: 320, background: 'white', borderRadius: 16, padding: 24, marginBottom: 32, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {cls.className}
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                      <FaQuestionCircle style={{ color: '#2980b9', cursor: 'pointer' }} title="Este gráfico mostra a média dos estilos de aprendizagem dos alunos desta turma." />
                    </span>
                  </h2>
                  <ReactECharts
                    option={{
                      ...baseChartOption,
                      series: [{
                        ...baseChartOption.series[0],
                        data: cls.avg,
                        itemStyle: {
                          color: function(params) {
                            return ['#2980b9', '#16a085', '#e67e22', '#c0392b'][params.dataIndex];
                          }
                        },
                        label: {
                          show: true,
                          position: 'right',
                          fontWeight: 'bold',
                          fontSize: 15,
                          formatter: function(params) {
                            return params.value > 0 ? params.value.toFixed(2) : '';
                          }
                        },
                        barWidth: 30 // Volta para largura mais padrão
                      }]
                    }}
                    style={{ height: 320, width: '100%' }}
                    onEvents={{
                      click: (params) => handleBarClick(params, cls)
                    }}
                  />
                  {/* Descrição do(s) estilo(s) predominante(s) */}
                  {(() => {
                    if (!cls.avg || cls.avg.length === 0) return null;
                    const max = Math.max(...cls.avg);
                    const indices = cls.avg
                      .map((v, i) => v === max ? i : -1)
                      .filter(i => i !== -1);
                    return (
                      <div style={{ marginTop: 16 }}>
                        <b>Estilo(s) predominante(s):</b>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                          {indices.map(idx2 => (
                            <li key={idx2}>
                              <b>{learningStyleLabels[idx2]}</b>: {learningStyleExplanations[idx2] ? learningStyleExplanations[idx2].split(':').slice(1).join(':').trim() : 'Descrição não encontrada.'}<br />
                              <span style={{ color: '#2980b9', fontStyle: 'italic' }}>{learningStyleHowPrefers[idx2] || ''}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
            {/* Card de sugestões de agrupamento por estilo predominante */}
            {agrupamentosPorEstilo.length > 0 && (
              <div style={{
                margin: '32px 0',
                background: '#f6f8fa',
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(41,128,185,0.08)',
                padding: 24,
                width: '100%',
                maxWidth: 'none',
                display: 'block'
              }}>
                {/* Gráfico de agrupamento por estilo */}
                <div style={{ width: '100%', maxWidth: 900, margin: '0 0 24px 0' }}>
                  <h2 style={{ color: '#222', textAlign: 'left', marginBottom: 16, marginTop: 0, paddingLeft: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    Distribuição dos alunos por estilo de aprendizagem predominante
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                      <FaQuestionCircle style={{ color: '#2980b9', cursor: 'pointer' }} title="Este gráfico mostra a quantidade de alunos do professor agrupados pelo estilo de aprendizagem predominante, segundo o questionário de Honey-Alonso." />
                    </span>
                  </h2>
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <ReactECharts
                      option={{
                        tooltip: { trigger: 'item', formatter: '{b}: {c} aluno(s) ({d}%)' },
                        legend: {
                          orient: 'vertical',
                          left: 0,
                          top: 'center',
                          data: learningStyleLabels
                        },
                        series: [{
                          name: 'Alunos',
                          type: 'pie',
                          radius: ['40%', '70%'],
                          avoidLabelOverlap: false,
                          label: {
                            show: true,
                            position: 'outside',
                            formatter: '{b}: {c}'
                          },
                          emphasis: {
                            label: {
                              show: true,
                              fontSize: 18,
                              fontWeight: 'bold'
                            }
                          },
                          labelLine: { show: true },
                          data: pizzaData,
                          itemStyle: {
                            color: function(params) {
                              return ['#2980b9', '#16a085', '#e67e22', '#c0392b'][params.dataIndex];
                            }
                          }
                        }]
                      }}
                      style={{ height: 340, width: '100%' }}
                      onEvents={{
                        click: (params) => {
                          if (params && typeof params.dataIndex === 'number') {
                            const styleIdx = params.dataIndex;
                            // Filtra alunos daquele estilo e ordena por predominância
                            const alunos = alunosPorEstilo[styleIdx]
                              .map(aluno => {
                                // Descobre as turmas do aluno
                                const turmas = classAverages.filter(cls => (cls.students||[]).includes(aluno.name)).map(cls => cls.className);
                                return {
                                  name: aluno.name,
                                  turmas,
                                  valor: aluno.percentages[styleIdx] || 0
                                };
                              })
                              .sort((a, b) => b.valor - a.valor);
                            setPizzaModal({ open: true, styleIdx, alunos });
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <h2 style={{ color: '#2980b9', marginBottom: 12 }}>Sugestões de agrupamento por estilo de aprendizagem predominante</h2>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  {agrupamentosPorEstilo.map((grupo, i) => (
                    <li key={i} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span>
                        <b>{grupo.estilo}:</b> {grupo.alunos.map((aluno, j) => {
                          const turmas = classAverages.filter(cls => (cls.students||[]).includes(aluno)).map(cls => cls.className);
                          return `${aluno}${turmas.length ? ' (' + turmas.join(', ') + ')' : ''}${j < grupo.alunos.length - 1 ? ', ' : ''}`;
                        })}
                      </span>
                      <button
                        style={{
                          marginLeft: 8,
                          padding: '4px 14px',
                          borderRadius: 8,
                          background: '#2980b9',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: 14
                        }}
                        onClick={async () => {
                          setCreateClassFeedback({ msg: '', success: null });
                          try {
                            await api.post('/classes', {
                              name: `${grupo.estilo} (${new Date().toLocaleDateString()})`,
                              studentIds: allStudents.filter(s => grupo.alunos.includes(s.name)).map(s => s.id)
                            });
                            setCreateClassFeedback({ msg: 'Turma criada com sucesso!', success: true });
                            // Opcional: atualizar turmas sem reload
                            // window.location.reload();
                          } catch (e) {
                            setCreateClassFeedback({ msg: 'Erro ao criar turma: ' + (e?.response?.data?.message || e.message), success: false });
                          }
                        }}
                      >Criar turma</button>
                    </li>
                  ))}
                </ul>
                {createClassFeedback.msg && (
                  <div style={{ marginTop: 24, color: createClassFeedback.success ? '#27ae60' : '#c0392b', fontWeight: 'bold', fontSize: 16 }}>
                    {createClassFeedback.msg}
                  </div>
                )}
              </div>
            )}
            {/* Modal para mostrar valores por aluno */}
            <Modal
              isOpen={modalOpen}
              onRequestClose={() => setModalOpen(false)}
              contentLabel="Valores por aluno"
              style={{
                content: {
                  top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.5)", borderRadius: 20,
                  backgroundColor: "#FFF", width: 500, minHeight: 200,
                  maxWidth: "90vw", padding: 32, overflow: "auto"
                }
              }}
            >
              <h2>{modalData.className} - {learningStyleLabels[modalData.styleIdx]}</h2>
              {/* Tabela de valores por aluno */}
              <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Aluno</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Valor (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {modalData.students.length === 0 ? (
                    <tr><td colSpan={2}>Nenhum dado encontrado.</td></tr>
                  ) : (
                    modalData.students.map((aluno, i) => (
                      <tr key={i}>
                        <td style={{ padding: 8 }}>{aluno.name}</td>
                        <td style={{ padding: 8 }}>{aluno.percentages ? Number(aluno.percentages[modalData.styleIdx]).toFixed(2) : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <button onClick={() => setModalOpen(false)} style={{ padding: '8px 24px', borderRadius: 8, background: '#2980b9', color: '#fff', border: 'none', fontWeight: 'bold' }}>Fechar</button>
              </div>
            </Modal>
            {/* Modal para alunos da fatia do gráfico de pizza */}
            <Modal
              isOpen={pizzaModal.open}
              onRequestClose={() => setPizzaModal({ ...pizzaModal, open: false })}
              contentLabel="Alunos do estilo"
              style={{
                content: {
                  top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.5)', borderRadius: 20,
                  backgroundColor: '#FFF', width: 500, minHeight: 200,
                  maxWidth: '90vw', padding: 32, overflow: 'auto'
                }
              }}
            >
              <h2>Alunos com estilo <b>{learningStyleLabels[pizzaModal.styleIdx]}</b></h2>
              <table style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Aluno</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Turmas</th>
                    <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: 8 }}>Predominância (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {pizzaModal.alunos.length === 0 ? (
                    <tr><td colSpan={3}>Nenhum aluno encontrado.</td></tr>
                  ) : (
                    pizzaModal.alunos.map((aluno, i) => (
                      <tr key={i}>
                        <td style={{ padding: 8 }}>{aluno.name}</td>
                        <td style={{ padding: 8 }}>{aluno.turmas.join(', ')}</td>
                        <td style={{ padding: 8 }}>{Number(aluno.valor).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <button onClick={() => setPizzaModal({ ...pizzaModal, open: false })} style={{ padding: '8px 24px', borderRadius: 8, background: '#2980b9', color: '#fff', border: 'none', fontWeight: 'bold' }}>Fechar</button>
              </div>
            </Modal>
          </>
        )}
      </div>
    </Container>
  );
};

export default LearningPreferencesDashboard;

/*
  Comentários:
  - O componente exibe estatísticas dos estilos de aprendizagem dos alunos do professor, com base no questionário de Honey-Alonso.
  - Mostra gráficos apenas com a média por turma.
  - Os dados são buscados via API e os gráficos são atualizados com as informações recebidas.
  - Código simplificado: removidos estados e funções não utilizados, comentários explicativos.
*/

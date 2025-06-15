"use client";
import { useState, useEffect } from "react";
import { Container } from "./styles";
import { Header } from "@/components/Header";
import ReactECharts from "echarts-for-react";
import { api } from "@/lib/api";
import './styles.css';
import Modal from "react-modal";
import { FaQuestionCircle } from "react-icons/fa";

const intelligenceLabels = [
  'Linguística', 'Lógico-matemática', 'Espacial', 'Corporal-cinestésica',
  'Musical', 'Interpessoal', 'Intrapessoal', 'Naturalista'
];

const intelligenceExplanations = [
  'Linguística: Facilidade com palavras, leitura, escrita e comunicação verbal. Pessoas com essa inteligência gostam de ler, escrever, contar histórias e têm boa comunicação. Costumam aprender melhor por meio de textos e conversas.',
  'Lógico-matemática: Habilidade com lógica, números, padrões e resolução de problemas. Indivíduos com essa inteligência gostam de desafios matemáticos, experimentos científicos e pensam de forma estruturada e analítica.',
  'Espacial: Capacidade de visualizar e manipular imagens, mapas e espaços. Pessoas com inteligência espacial têm facilidade para desenhar, montar quebra-cabeças, imaginar cenários e compreender mapas e gráficos.',
  'Corporal-cinestésica: Controle do corpo, coordenação motora e expressão através do movimento. Essa inteligência é marcante em quem pratica esportes, dança, teatro ou trabalhos manuais, aprendendo melhor com o corpo em ação.',
  'Musical: Sensibilidade para ritmos, sons, melodias e apreciação musical. Indivíduos musicais gostam de cantar, tocar instrumentos, compor músicas e têm facilidade para perceber padrões sonoros.',
  'Interpessoal: Facilidade para entender, interagir e se comunicar com outras pessoas. Pessoas interpessoais são empáticas, gostam de trabalhar em grupo, liderar, ensinar e resolver conflitos.',
  'Intrapessoal: Autoconhecimento, reflexão sobre sentimentos e objetivos pessoais. Quem tem essa inteligência reflete sobre si mesmo, reconhece emoções, estabelece metas e busca o autodesenvolvimento.',
  'Naturalista: Interesse e sensibilidade para a natureza, animais e fenômenos naturais. Indivíduos naturalistas gostam de estar ao ar livre, cuidar de plantas e animais, e têm facilidade para identificar padrões na natureza.'
];

const baseChartOption = {
  tooltip: {},
  xAxis: { type: 'value' },
  yAxis: {
    type: 'category',
    data: intelligenceLabels,
    axisLabel: {
      width: 180,
      formatter: value => value.length > 18 ? value.match(/.{1,18}/g).join('\n') : value
    }
  },
  series: [{
    name: 'Média',
    type: 'bar',
    data: Array(8).fill(0),
    itemStyle: { color: '#8e44ad' },
    barCategoryGap: '30%'
  }],
  grid: { left: 130, right: 40, top: 40, bottom: 40 }
};

const LearningTeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [studentsAvg, setStudentsAvg] = useState(Array(8).fill(0));
  const [classAverages, setClassAverages] = useState([]); // [{ className, avg: [..] }]
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ className: '', intelligenceIdx: 0, students: [] });
  const [allStudents, setAllStudents] = useState([]);
  const [creatingGroupIdx, setCreatingGroupIdx] = useState(null);
  const [groupCreateMsg, setGroupCreateMsg] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await api.get("/learning/teacher-stats");
        setStudentsAvg(res.data.studentsAvg || Array(8).fill(0));
        setClassAverages(res.data.classes || []);
        setAllStudents(res.data.allStudents || []);
      } catch (e) {
        setStudentsAvg(Array(8).fill(0));
        setClassAverages([]);
        setAllStudents([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Handler para abrir modal ao clicar na barra
  const handleBarClick = async (params, turma) => {
    const intelligenceIdx = params.dataIndex;
    // Busca alunos da turma e seus resultados
    try {
      const res = await api.get(`/classes/${turma.id}/students-learning?intelligenceIdx=${intelligenceIdx}`);
      // res.data: [{ name, percentages: [..] }]
      setModalData({
        className: turma.name,
        intelligenceIdx,
        students: res.data.students || []
      });
      setModalOpen(true);
    } catch {
      setModalData({ className: turma.name, intelligenceIdx, students: [] });
      setModalOpen(true);
    }
  };

  // Função para criar turma a partir de sugestão de grupo
  async function handleCreateGroupClass(group, groupIdx) {
    setGroupCreateMsg(null);
    setCreatingGroupIdx(groupIdx);
    try {
      // Extrai nomes dos alunos (removendo o nome da turma, se houver)
      const studentNames = group.students.map(s => s.replace(/ \(.*\)$/, ''));
      // Busca os ids dos alunos em allStudents
      const studentIds = allStudents.filter(a => studentNames.includes(a.name)).map(a => a.id);
      if (studentIds.length === 0) throw new Error('Nenhum aluno encontrado.');
      // Chama API para criar turma
      const res = await api.post('/classes', {
        name: `Grupo ${group.label} (${new Date().toLocaleDateString()})`,
        studentIds
      });
      setGroupCreateMsg({ success: true, text: `Turma criada com sucesso: ${res.data.className || 'Nova turma'}` });
      // Atualiza a lista de turmas após criar
      const fetchData = async () => {
        setLoading(true);
        try {
          const res = await api.get("/learning/teacher-stats");
          setStudentsAvg(res.data.studentsAvg || Array(8).fill(0));
          setClassAverages(res.data.classes || []);
          setAllStudents(res.data.allStudents || []);
        } catch (e) {
          setStudentsAvg(Array(8).fill(0));
          setClassAverages([]);
          setAllStudents([]);
        }
        setLoading(false);
      };
      await fetchData();
    } catch (e) {
      setGroupCreateMsg({ success: false, text: 'Erro ao criar turma.' });
    }
    setCreatingGroupIdx(null);
  }

  return (
    <Container>
      <Header/>
      <div style={{ padding: 24 }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Estatísticas das Inteligências Múltiplas por Turma
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <FaQuestionCircle style={{ color: '#8e44ad', cursor: 'pointer' }} title="Cada gráfico mostra a média das inteligências predominantes dos alunos de cada turma." />
          </span>
        </h1>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            {classAverages.length === 0 && (
              <>
                <p>Nenhuma turma encontrada.</p>
                <pre style={{background:'#eee',padding:8}}>{JSON.stringify({studentsAvg, classAverages}, null, 2)}</pre>
              </>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'stretch', justifyContent: 'flex-start' }}>
              {classAverages.map((cls, idx) => (
                <div key={idx} style={{ flex: '1 1 48%', maxWidth: '48%', minWidth: 320, background: 'white', borderRadius: 16, padding: 24, marginBottom: 32, display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {cls.className}
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                      <FaQuestionCircle style={{ color: '#8e44ad', cursor: 'pointer' }} title="Este gráfico mostra a média das inteligências dos alunos desta turma." />
                    </span>
                  </h2>
                  <ReactECharts 
                    option={{
                      ...baseChartOption,
                      series: [{ ...baseChartOption.series[0], data: cls.avg }]
                    }} 
                    style={{ height: 320, width: '100%' }}
                    onEvents={{
                      click: (params) => handleBarClick(params, cls)
                    }}
                  />
                  {/* Descrição da(s) inteligência(s) predominante(s) */}
                  {(() => {
                    if (!cls.avg || cls.avg.length === 0) return null;
                    const max = Math.max(...cls.avg);
                    const indices = cls.avg
                      .map((v, i) => v === max ? i : -1)
                      .filter(i => i !== -1);
                    return (
                      <div style={{ marginTop: 16 }}>
                        <b>Inteligência(s) predominante(s):</b>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                          {indices.map(idx2 => (
                            <li key={idx2}>
                              <b>{intelligenceLabels[idx2]}</b>: {intelligenceExplanations[idx2].split(':').slice(1).join(':').trim()}
                            </li>
                          ))}
                        </ul>
                        {/* Sugestões de ensino */}
                        <div style={{ marginTop: 12, background: '#f8f6ff', borderRadius: 8, padding: 12, fontSize: 15 }}>
                          <b>Sugestões de ensino para esta turma:</b>
                          <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                            {indices.map(idx2 => (
                              <li key={idx2}>
                                {getTeachingSuggestion(idx2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
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
              <h2>{modalData.className} - {intelligenceLabels[modalData.intelligenceIdx]}</h2>
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
                        <td style={{ padding: 8 }}>{aluno.percentages ? Number(aluno.percentages[modalData.intelligenceIdx]).toFixed(2) : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <button onClick={() => setModalOpen(false)} style={{ padding: '8px 24px', borderRadius: 8, background: '#8e44ad', color: '#fff', border: 'none', fontWeight: 'bold' }}>Fechar</button>
              </div>
            </Modal>
            {/* Scatter chart global de todos os alunos */}
            <div style={{ margin: '48px 0 0 0', background: '#fff', borderRadius: 16, padding: 24 }}>
              <h2 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                Distribuição Global dos Alunos (2 inteligências predominantes)
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  <FaQuestionCircle style={{ color: '#8e44ad', cursor: 'pointer' }} title="Este gráfico mostra a distribuição dos alunos considerando suas duas inteligências mais altas, agrupando-os visualmente." />
                </span>
              </h2>
              <ReactECharts
                option={{
                  tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                      const aluno = params.data;
                      return `<b>${aluno.name}</b><br/>${aluno.classNames ? aluno.classNames.join(', ') : ''}<br/>${intelligenceLabels[aluno.xIdx]}: ${aluno.xVal.toFixed(2)}<br/>${intelligenceLabels[aluno.yIdx]}: ${aluno.yVal.toFixed(2)}`;
                    }
                  },
                  xAxis: {
                    name: '1ª Inteligência',
                    min: 0, max: 100,
                    splitLine: { show: true },
                    axisLabel: {
                      formatter: function(value) {
                        return value;
                      }
                    }
                  },
                  yAxis: {
                    name: '2ª Inteligência',
                    min: 0, max: 100,
                    splitLine: { show: true },
                    axisLabel: {
                      formatter: function(value) {
                        return value;
                      }
                    }
                  },
                  series: [{
                    symbolSize: 18,
                    data: allStudents.map(aluno => {
                      const arr = (aluno.percentages || []).map((v, i) => ({ v, i }));
                      const sorted = arr.slice().sort((a, b) => b.v - a.v);
                      const xIdx = sorted[0]?.i ?? 0;
                      const yIdx = sorted[1]?.i ?? 1;
                      return {
                        value: [sorted[0]?.v ?? 0, sorted[1]?.v ?? 0],
                        name: aluno.name,
                        classNames: aluno.classNames || [],
                        xIdx, yIdx,
                        xVal: sorted[0]?.v ?? 0,
                        yVal: sorted[1]?.v ?? 0
                      };
                    }),
                    type: 'scatter',
                    itemStyle: { color: '#8e44ad', opacity: 0.7 }
                  }]
                }}
                style={{ height: 420, width: '100%' }}
              />
              <div style={{ marginTop: 32 }}>
                <h3>Sugestões de agrupamento global</h3>
                {(() => {
                  const groups = getGroupingSuggestions(allStudents);
                  // Filtra sugestões que já existem como turma
                  const filteredGroups = groups.filter(g => {
                    if (!g.students.length) return true; // mantém sugestões vazias
                    // Extrai nomes dos alunos do grupo (removendo o nome da turma, se houver)
                    const groupStudentNames = g.students.map(s => s.replace(/ \(.*\)$/, '')).sort();
                    // Procura turma com exatamente os mesmos alunos (agora cls.students é array de nomes)
                    return !classAverages.some(cls => {
                      if (!cls.students || cls.students.length !== groupStudentNames.length) return false;
                      const classStudentNames = cls.students.slice().sort();
                      return JSON.stringify(classStudentNames) === JSON.stringify(groupStudentNames);
                    });
                  });
                  return (
                    <ul style={{ margin: '12px 0 0 0', paddingLeft: 20 }}>
                      {filteredGroups.map((g, i) => (
                        <li key={i} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span><b>{g.label}:</b> {g.students.length > 0 ? g.students.join(', ') : 'Nenhum grupo significativo.'}</span>
                          {g.students.length > 0 && (
                            <button
                              onClick={() => handleCreateGroupClass(g, i)}
                              style={{ padding: '4px 14px', borderRadius: 6, background: '#27ae60', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 14, cursor: 'pointer' }}
                              disabled={creatingGroupIdx === i}
                            >
                              {creatingGroupIdx === i ? 'Criando...' : 'Criar turma'}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  );
                })()}
                {groupCreateMsg && (
                  <div style={{ marginTop: 16, color: groupCreateMsg.success ? '#27ae60' : '#c0392b', fontWeight: 'bold' }}>{groupCreateMsg.text}</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export default LearningTeacherDashboard;

/*
  Comentários:
  - O componente exibe estatísticas das inteligências múltiplas dos alunos do professor.
  - Mostra gráficos apenas com a média por turma.
  - Os dados são buscados via API e os gráficos são atualizados com as informações recebidas.
  - Código simplificado: removidos estados e funções não utilizados, comentários explicativos.
*/

// Função utilitária para sugestões de ensino
function getTeachingSuggestion(idx) {
  switch(idx) {
    case 0: return 'Utilize debates, leituras, produção de textos, dramatizações e atividades de escrita criativa.';
    case 1: return 'Proponha resolução de problemas, jogos de lógica, experimentos, desafios matemáticos e análise de padrões.';
    case 2: return 'Inclua mapas, gráficos, desenhos, modelagem, uso de imagens e atividades de visualização espacial.';
    case 3: return 'Aposte em atividades práticas, jogos, esportes, teatro, dança, experimentação e aprendizagem ativa.';
    case 4: return 'Incorpore música, ritmo, composição, análise de letras, uso de instrumentos e trilhas sonoras.';
    case 5: return 'Promova trabalhos em grupo, projetos colaborativos, discussões, dinâmicas e atividades de liderança.';
    case 6: return 'Estimule autorreflexão, diários, definição de metas, meditação, autoavaliação e projetos individuais.';
    case 7: return 'Realize atividades ao ar livre, estudos de campo, jardinagem, observação da natureza e projetos ambientais.';
    default: return '';
  }
}

// Função utilitária para sugestões de agrupamento
function getGroupingSuggestions(students) {
  // Agrupa por par de inteligências predominantes (ex: "Linguística & Espacial")
  const map = {};
  students.forEach(aluno => {
    const arr = (aluno.percentages || []).map((v, i) => ({ v, i }));
    const sorted = arr.slice().sort((a, b) => b.v - a.v);
    const xIdx = sorted[0]?.i ?? 0;
    const yIdx = sorted[1]?.i ?? 1;
    const key = `${xIdx}-${yIdx}`;
    if (!map[key]) map[key] = [];
    map[key].push(aluno.name + (aluno.className ? ` (${aluno.className})` : ''));
  });
  // Ordena por tamanho do grupo (maiores primeiro)
  const groups = Object.entries(map)
    .filter(([, students]) => students.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([key, students]) => {
      const [xIdx, yIdx] = key.split('-').map(Number);
      return {
        label: `${intelligenceLabels[xIdx]} & ${intelligenceLabels[yIdx]}`,
        students
      };
    });
  return groups.length > 0 ? groups : [{ label: 'Nenhum grupo significativo encontrado', students: [] }];
}

"use client";
import { useState, useEffect } from "react";
import { 
  Container, 
  ModalContent, 
  ModalButtonsContent
} from "./styles";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { api } from "@/lib/api";
import Modal from "react-modal";
import ReactECharts from 'echarts-for-react';
import { toast } from "react-toastify";
import './styles.css';

// Labels dos estilos de aprendizagem (CHAEA)
const styleLabels = [
  'Ativo', 'Reflexivo', 'Teórico', 'Pragmático'
];

// Perguntas do CHAEA (exemplo, 10 para cada estilo)
const questions = [
  // Ativo
  "Gosto de novas experiências e desafios.",
  "Participo ativamente de atividades em grupo.",
  "Sou espontâneo e gosto de agir rapidamente.",
  "Gosto de resolver problemas de forma prática.",
  "Tenho facilidade em iniciar conversas.",
  "Gosto de experimentar sem medo de errar.",
  "Prefiro ação a planejamento.",
  "Gosto de correr riscos calculados.",
  "Sou entusiasmado com novidades.",
  "Gosto de atividades dinâmicas.",
  // Reflexivo
  "Prefiro observar antes de agir.",
  "Gosto de analisar diferentes pontos de vista.",
  "Sou cuidadoso ao tomar decisões.",
  "Gosto de ouvir mais do que falar.",
  "Reflito sobre minhas experiências.",
  "Prefiro pensar antes de agir.",
  "Gosto de anotar e registrar informações.",
  "Observo detalhes que outros não percebem.",
  "Gosto de analisar causas e consequências.",
  "Sou paciente ao aprender.",
  // Teórico
  "Gosto de modelos, teorias e conceitos.",
  "Procuro lógica e coerência nas informações.",
  "Gosto de estruturar ideias de forma organizada.",
  "Prefiro informações fundamentadas.",
  "Gosto de analisar sistemas e estruturas.",
  "Busco explicações racionais.",
  "Gosto de estudar regras e princípios.",
  "Prefiro clareza e objetividade.",
  "Gosto de planejar antes de agir.",
  "Sou exigente com argumentos e provas.",
  // Pragmático
  "Gosto de aplicar o que aprendo na prática.",
  "Prefiro soluções objetivas e diretas.",
  "Gosto de testar ideias imediatamente.",
  "Sou prático e objetivo.",
  "Gosto de resultados rápidos.",
  "Prefiro métodos comprovados.",
  "Gosto de adaptar ideias à realidade.",
  "Busco eficiência nas tarefas.",
  "Gosto de aprender fazendo.",
  "Prefiro atividades com aplicação imediata."
];

// Explicações dos estilos de aprendizagem
const styleExplanations = [
  'Ativo: Pessoas com esse estilo gostam de novas experiências, envolvem-se em atividades, são espontâneas, abertas e gostam de desafios. Aprendem melhor participando e experimentando. Geralmente preferem aprender em grupo, gostam de dinâmicas, jogos, simulações e situações práticas. Podem se sentir entediadas com tarefas repetitivas ou muita teoria, buscando sempre novidades e ação.',
  'Reflexivo: Pessoas reflexivas preferem observar, analisar e refletir antes de agir. Gostam de considerar diferentes pontos de vista e aprendem melhor pensando cuidadosamente sobre as situações. Tendem a ser observadores atentos, valorizam o tempo para ponderar e organizar informações antes de tomar decisões. Sentem-se confortáveis em ambientes calmos, onde podem analisar dados e experiências sem pressa.',
  'Teórico: Indivíduos teóricos valorizam lógica, modelos, teorias e organização. Gostam de analisar, estruturar e buscar explicações racionais, aprendendo melhor com conceitos claros e fundamentados. Preferem materiais bem organizados, esquemas, mapas conceituais e explicações detalhadas. Costumam questionar a coerência das informações e buscam entender os princípios por trás dos fatos.',
  'Pragmático: Pessoas pragmáticas focam na aplicação prática do conhecimento. Gostam de testar ideias, buscar resultados rápidos e aprender fazendo, preferindo métodos objetivos e eficientes. Sentem-se motivadas por desafios concretos, resolução de problemas e tarefas com aplicação imediata. Valorizam exemplos reais, ferramentas práticas e instruções claras para colocar o aprendizado em prática rapidamente.'
];

// Configuração do gráfico
const baseChartOption = {
  tooltip: {},
  xAxis: { type: 'value' },
  yAxis: {
    type: 'category',
    data: styleLabels,
    axisLabel: {
      width: 180,
      formatter: value => value.length > 18 ? value.match(/.{1,18}/g).join('\n') : value
    }
  },
  series: [{
    name: 'Pontuação',
    type: 'bar',
    data: Array(4).fill(0),
    itemStyle: { color: '#8e44ad' },
    barCategoryGap: '30%'
  }],
  grid: { left: 130, right: 40, top: 40, bottom: 40 }
};

const LearningDashboard = () => {
  // Estados principais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [stylePercentages, setStylePercentages] = useState(null);

  // Abre o modal e reseta respostas
  function openModal() {
    setIsModalOpen(true);
    setCurrentPage(0);
    setAnswers(Array(questions.length).fill(null));
  }

  // Fecha o modal
  function closeModal() {
    setIsModalOpen(false);
  }

  // Calcula pontuação de cada estilo (sim=1, não=0)
  const getStyleScores = () => {
    const scores = Array(styleLabels.length).fill(0);
    answers.forEach((ans, i) => {
      if (ans === 1) scores[Math.floor(i / 10)] += 1;
    });
    return scores;
  };

  // Calcula porcentagem de cada estilo
  const getStylePercentages = () => {
    const scores = getStyleScores();
    const totalScore = scores.reduce((sum, val) => sum + val, 0) || 1;
    const percentages = scores.map(score => (score / totalScore) * 100);
    return percentages;
  };

  // Salva resposta e avança para próxima pergunta
  const handleAnswer = value => {
    const updated = [...answers];
    updated[currentPage] = value;
    setAnswers(updated);
    if (currentPage < questions.length - 1) setCurrentPage(currentPage + 1);
  };

  // Volta para pergunta anterior
  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  // Finaliza questionário, salva resultado e fecha modal
  const handleFinish = async () => {
    const percentages = getStylePercentages();
    setStylePercentages(percentages);
    closeModal();
    toast.success("Questionário finalizado!");
    try {
      await api.post("/learning_preferences", { percentages });
    } catch {
      toast.error("Erro ao salvar resultado.");
    }
  };

  // Atualiza gráfico com os resultados
  const chartOption = {
    ...baseChartOption,
    series: [{ ...baseChartOption.series[0], data: stylePercentages || Array(4).fill(0) }]
  };

  // Função para obter explicações dos estilos predominantes
  const getPredominantExplanations = () => {
    if (!stylePercentages) return [];
    const max = Math.max(...stylePercentages);
    // Pode haver empate
    return stylePercentages
      .map((perc, idx) => perc === max ? { label: styleLabels[idx], explanation: styleExplanations[idx] } : null)
      .filter(Boolean);
  };

  useEffect(() => {
    async function fetchLearningPreferences() {
      try {
        const response = await api.get("/learning_preferences");
        const result = response.data.result;
        if (result && result.percentages) {
          setStylePercentages(result.percentages);
        }
      } catch {
        // Se não houver resultado, deixa o gráfico zerado
      }
    }
    fetchLearningPreferences();
  }, []);

  return (
    <Container>
      <Header/>
      <div style={{ padding: "10px" }}>
        <div className="row justify-content-around">
          <div className="col-5">
            <div id="predominant_intelligences" style={{ backgroundColor: "white", padding: 20, borderRadius: 16 }}>
              <h1>Meu estilo de aprendizagem predominante</h1>
              {getPredominantExplanations().length > 0 ? (
                getPredominantExplanations().map((item, i) => (
                  <p key={i} style={{ marginTop: 16 }}>
                    <b>{item.label}:</b> {item.explanation.split(':').slice(1).join(':').trim()}
                  </p>
                ))
              ) : (
                <p style={{ marginTop: 16 }}>Responda o questionário para descobrir seu estilo de aprendizagem predominante.</p>
              )}
            </div>
          </div>
          <div className="col-5">
            <div style={{ backgroundColor: "white", padding: 20, borderRadius: 16 }}>
              <h1>Estilos de Aprendizagem (CHAEA)</h1>
              <div style={{ backgroundColor: "white", padding: 20, borderRadius: 16 }}>
                <ReactECharts option={chartOption} style={{ height: 300 }} />
              </div>
              <p>Esses estilos refletem como você prefere aprender e processar informações.</p>
              <p>O questionário ajuda a identificar seu estilo de aprendizagem predominante.</p>
              <Button title="Refazer questionário" onClick={openModal} width="100%"/>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do questionário */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Questionário"
          style={{
            content: {
              top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.5)", borderRadius: 20,
              backgroundColor: "#FFF", width: 700, minHeight: 400,
              maxWidth: "90vw", height: "60vh", padding: 40,
              overflow: "auto"
            }
          }}
        >
          <ModalContent>
            <h2>Instruções: Marque de 1 a 5 conforme o quanto a afirmação se parece com você:</h2>
            <h2>1 = Nada a ver | 2 = Pouco | 3 = Mais ou menos | 4 = Bastante | 5 = Totalmente</h2>
            <div style={{ margin: "32px 0" }}>
              <h3>Pergunta {currentPage + 1} de {questions.length}</h3>
              <p style={{ fontSize: 20 }}>{questions[currentPage]}</p>
              <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
                {[1, 0].map(value => (
                  <Button
                    key={value}
                    title={value === 1 ? "Sim" : "Não"}
                    width={100}
                    onClick={() => handleAnswer(value)}
                    style={{
                      background: answers[currentPage] === value ? "#4F8EF7" : "#eee",
                      color: answers[currentPage] === value ? "#fff" : "#333"
                    }}
                  />
                ))}
              </div>
            </div>
            <ModalButtonsContent>
              <Button title="Cancelar" width="100%" onClick={closeModal} />
              {currentPage > 0 && (
                <Button title="Anterior" width="100%" onClick={handlePrev} />
              )}
              {currentPage === questions.length - 1 && answers[currentPage] !== null && (
                <Button title="Finalizar" width="100%" onClick={handleFinish} />
              )}
            </ModalButtonsContent>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default LearningDashboard;

/*
  Comentários:
  - O componente exibe um dashboard com gráfico dos estilos de aprendizagem e um botão para refazer o questionário.
  - O questionário é exibido em um modal, uma pergunta por vez, com respostas de 1 a 5.
  - Ao finalizar, calcula e salva as porcentagens de cada estilo.
  - O gráfico é atualizado com os resultados.
  - Código simplificado: removidos imports e estados não utilizados, funções compactadas e comentários explicativos.
*/

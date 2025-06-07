"use client";
import { useState } from "react";
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

// Labels das inteligências
const intelligenceLabels = [
  'Linguística', 'Lógico-matemática', 'Espacial', 'Corporal-cinestésica',
  'Musical', 'Interpessoal', 'Intrapessoal', 'Naturalista'
];

// Perguntas do questionário (3 para cada inteligência)
const questions = [
  // Inteligência Linguística
  "Gosto de ler livros, revistas ou escrever.",
  "Tenho facilidade para contar histórias ou explicar algo.",
  "Aprendo melhor ouvindo ou lendo.",
  // Inteligência Lógico-Matemática
  "Gosto de resolver problemas e desafios com lógica.",
  "Me interesso por ciência, matemática e tecnologia.",
  "Penso em padrões e sequências com facilidade.",
  // Inteligência Espacial
  "Tenho facilidade para desenhar ou imaginar cenas.",
  "Gosto de mapas, gráficos ou montar quebra-cabeças.",
  "Imagino as coisas com riqueza de detalhes.",
  // Inteligência Corporal-Cinestésica
  "Gosto de atividades físicas ou mexer com as mãos.",
  "Tenho boa coordenação e aprendo com movimento.",
  "Expresso emoções através do corpo.",
  // Inteligência Musical
  "Canto, toco instrumentos ou tenho sensibilidade para música.",
  "Identifico ritmos, tons e melodias com facilidade.",
  "Gosto de ouvir música enquanto estudo ou trabalho.",
  // Inteligência Interpessoal
  "Faço amizades com facilidade e entendo os outros.",
  "Trabalho bem em grupo ou liderando.",
  "Gosto de ajudar e conversar com pessoas.",
  // Inteligência Intrapessoal
  "Conheço meus sentimentos e reflito sobre mim.",
  "Gosto de ter momentos a sós e pensar na vida.",
  "Tenho metas pessoais bem definidas.",
  // Inteligência Naturalista
  "Me interesso por plantas, animais ou fenômenos naturais.",
  "Gosto de estar ao ar livre, em contato com a natureza.",
  "Consigo perceber mudanças no ambiente com facilidade."
];

// Configuração do gráfico
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
    name: 'Pontuação',
    type: 'bar',
    data: Array(8).fill(0),
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
  const [intelligencePercentages, setIntelligencePercentages] = useState(null);

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

  // Calcula pontuação de cada inteligência
  const getIntelligenceScores = () => {
    const scores = Array(intelligenceLabels.length).fill(0);
    answers.forEach((ans, i) => {
      if (ans) scores[Math.floor(i / 3)] += ans;
    });
    return scores;
  };

  // Calcula porcentagem de cada inteligência
  const getIntelligencePercentages = () => {
    const scores = getIntelligenceScores();
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
    const percentages = getIntelligencePercentages();
    setIntelligencePercentages(percentages);
    closeModal();
    toast.success("Questionário finalizado!");
    try {
      await api.post("/student/intelligences", { answers, percentages });
    } catch {
      toast.error("Erro ao salvar resultado.");
    }
  };

  // Atualiza gráfico com os resultados
  const chartOption = {
    ...baseChartOption,
    series: [{ ...baseChartOption.series[0], data: intelligencePercentages || Array(8).fill(0) }]
  };

  return (
    <Container>
      <Header/>
      <div style={{ padding: "10px" }}>
        <div className="row justify-content-around">
          <div className="col-5">
            <div style={{ backgroundColor: "white", padding: 20, borderRadius: 16 }}>
              <h1>Minhas inteligências predominantes</h1>
            </div>
          </div>
          <div className="col-5">
            <div style={{ backgroundColor: "white", padding: 20, borderRadius: 16 }}>
              <h1>Inteligências Múltiplas</h1>
              <div style={{ backgroundColor: "white", padding: 20, borderRadius: 16 }}>
                <ReactECharts option={chartOption} style={{ height: 300 }} />
              </div>
              <p>Cada pessoa possui todas essas inteligências em graus diferentes. Elas podem ser desenvolvidas com prática e estímulo.</p>
              <p>O questionário ajuda a identificar suas inteligências predominantes.</p>
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
                {[1,2,3,4,5].map(value => (
                  <Button
                    key={value}
                    title={value}
                    width={50}
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
              {currentPage === questions.length - 1 && answers[currentPage] && (
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
  - O componente exibe um dashboard com gráfico das inteligências e um botão para refazer o questionário.
  - O questionário é exibido em um modal, uma pergunta por vez, com respostas de 1 a 5.
  - Ao finalizar, calcula e salva as porcentagens de cada inteligência.
  - O gráfico é atualizado com os resultados.
  - Código simplificado: removidos imports e estados não utilizados, funções compactadas e comentários explicativos.
*/

import { useState } from "react";
import Modal from "react-modal";
import { Button } from "@/components/Button";

// Labels das inteligências
const intelligenceLabels = [
  'Linguística', 'Lógico-matemática', 'Espacial', 'Corporal-cinestésica',
  'Musical', 'Interpessoal', 'Intrapessoal', 'Naturalista'
];
const intelligenceQuestions = [
  // ... (mesmas perguntas do dashboard)
  "Gosto de ler livros, revistas ou escrever.",
  "Tenho facilidade para contar histórias ou explicar algo.",
  "Aprendo melhor ouvindo ou lendo.",
  "Gosto de resolver problemas e desafios com lógica.",
  "Me interesso por ciência, matemática e tecnologia.",
  "Penso em padrões e sequências com facilidade.",
  "Tenho facilidade para desenhar ou imaginar cenas.",
  "Gosto de mapas, gráficos ou montar quebra-cabeças.",
  "Imagino as coisas com riqueza de detalhes.",
  "Gosto de atividades físicas ou mexer com as mãos.",
  "Tenho boa coordenação e aprendo com movimento.",
  "Expresso emoções através do corpo.",
  "Canto, toco instrumentos ou tenho sensibilidade para música.",
  "Identifico ritmos, tons e melodias com facilidade.",
  "Gosto de ouvir música enquanto estudo ou trabalho.",
  "Faço amizades com facilidade e entendo os outros.",
  "Trabalho bem em grupo ou liderando.",
  "Gosto de ajudar e conversar com pessoas.",
  "Conheço meus sentimentos e reflito sobre mim.",
  "Gosto de ter momentos a sós e pensar na vida.",
  "Tenho metas pessoais bem definidas.",
  "Me interesso por plantas, animais ou fenômenos naturais.",
  "Gosto de estar ao ar livre, em contato com a natureza.",
  "Consigo perceber mudanças no ambiente com facilidade."
];

// Labels dos estilos de aprendizagem
const styleLabels = [
  'Ativo', 'Reflexivo', 'Teórico', 'Pragmático'
];
const styleQuestions = [
  // ... (mesmas perguntas do dashboard)
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

export default function QuestionnaireModals({ open, onClose, onFinish }) {
  // Estados para controle dos dois questionários
  const [step, setStep] = useState(0); // 0: inteligências, 1: estilos
  const [intAnswers, setIntAnswers] = useState(Array(intelligenceQuestions.length).fill(null));
  const [styleAnswers, setStyleAnswers] = useState(Array(styleQuestions.length).fill(null));
  const [currentPage, setCurrentPage] = useState(0);

  // Funções para calcular resultados
  function getIntelligencePercentages() {
    const scores = Array(intelligenceLabels.length).fill(0);
    intAnswers.forEach((ans, i) => { if (ans) scores[Math.floor(i / 3)] += ans; });
    const total = scores.reduce((sum, v) => sum + v, 0) || 1;
    return scores.map(s => (s / total) * 100);
  }
  function getStylePercentages() {
    const scores = Array(styleLabels.length).fill(0);
    styleAnswers.forEach((ans, i) => { if (ans === 1) scores[Math.floor(i / 10)] += 1; });
    const total = scores.reduce((sum, v) => sum + v, 0) || 1;
    return scores.map(s => (s / total) * 100);
  }

  // Avançar/responder
  function handleAnswer(value) {
    if (step === 0) {
      const updated = [...intAnswers];
      updated[currentPage] = value;
      setIntAnswers(updated);
      if (currentPage < intelligenceQuestions.length - 1) setCurrentPage(currentPage + 1);
    } else {
      const updated = [...styleAnswers];
      updated[currentPage] = value;
      setStyleAnswers(updated);
      if (currentPage < styleQuestions.length - 1) setCurrentPage(currentPage + 1);
    }
  }
  function handlePrev() {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  }
  function handleFinish() {
    if (step === 0) {
      setStep(1);
      setCurrentPage(0);
    } else {
      onFinish({
        intelligencePercentages: getIntelligencePercentages(),
        stylePercentages: getStylePercentages()
      });
      setStep(0);
      setCurrentPage(0);
      setIntAnswers(Array(intelligenceQuestions.length).fill(null));
      setStyleAnswers(Array(styleQuestions.length).fill(null));
    }
  }
  function handleClose() {
    setStep(0);
    setCurrentPage(0);
    setIntAnswers(Array(intelligenceQuestions.length).fill(null));
    setStyleAnswers(Array(styleQuestions.length).fill(null));
    onClose();
  }

  // Renderização do modal
  const questions = step === 0 ? intelligenceQuestions : styleQuestions;
  const total = questions.length;
  const answers = step === 0 ? intAnswers : styleAnswers;
  const isInt = step === 0;

  return (
    <Modal
      isOpen={open}
      onRequestClose={handleClose}
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
      <div>
        <h2>{isInt ? "Questionário de Inteligências Múltiplas" : "Questionário de Estilos de Aprendizagem"}</h2>
        <h3>Pergunta {currentPage + 1} de {total}</h3>
        <p style={{ fontSize: 20 }}>{questions[currentPage]}</p>
        <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
          {isInt
            ? [1,2,3,4,5].map(value => (
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
              ))
            : [1,0].map(value => (
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
        <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
          <Button title="Cancelar" width="100%" onClick={handleClose} />
          {currentPage > 0 && (
            <Button title="Anterior" width="100%" onClick={handlePrev} />
          )}
          {currentPage === total - 1 && answers[currentPage] !== null && (
            <Button title={isInt ? "Próximo" : "Finalizar"} width="100%" onClick={handleFinish} />
          )}
        </div>
      </div>
    </Modal>
  );
}

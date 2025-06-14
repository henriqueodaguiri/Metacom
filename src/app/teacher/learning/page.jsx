"use client";
import { useState, useEffect } from "react";
import { Container } from "./styles";
import { Header } from "@/components/Header";
import ReactECharts from "echarts-for-react";
import { api } from "@/lib/api";
import './styles.css';

const intelligenceLabels = [
  'Linguística', 'Lógico-matemática', 'Espacial', 'Corporal-cinestésica',
  'Musical', 'Interpessoal', 'Intrapessoal', 'Naturalista'
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Busca todos os alunos do professor e suas turmas
        const res = await api.get("/learning/teacher-stats");
        // Esperado: { studentsAvg: [..], classes: [{ className, avg: [..] }] }
        setStudentsAvg(res.data.studentsAvg || Array(8).fill(0));
        setClassAverages(res.data.classes || []);
      } catch (e) {
        setStudentsAvg(Array(8).fill(0));
        setClassAverages([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Container>
      <Header/>
      <div style={{ padding: 24 }}>
        <h1>Estatísticas das Inteligências Múltiplas dos Alunos</h1>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 32 }}>
              <h2>Média geral dos alunos</h2>
              <ReactECharts option={{
                ...baseChartOption,
                series: [{ ...baseChartOption.series[0], data: studentsAvg }]
              }} style={{ height: 320 }} />
            </div>
            <div>
              <h2>Média por turma</h2>
              {classAverages.length === 0 && <p>Nenhuma turma encontrada.</p>}
              {classAverages.map((cls, idx) => (
                <div key={idx} style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 32 }}>
                  <h3>{cls.className}</h3>
                  <ReactECharts option={{
                    ...baseChartOption,
                    series: [{ ...baseChartOption.series[0], data: cls.avg }]
                  }} style={{ height: 320 }} />
                </div>
              ))}
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
  - Mostra dois gráficos: um com a média geral dos alunos e outro com a média por turma.
  - Os dados são buscados via API e os gráficos são atualizados com as informações recebidas.
  - Código simplificado: removidos estados e funções não utilizados, comentários explicativos.
*/

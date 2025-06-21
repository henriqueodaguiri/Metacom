"use client";
import { useEffect, useState } from "react";
import { Container, ContentContainer } from "./styles";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { ClassCard } from "@/components/ClassCard";
import { api } from "@/lib/api";
import { useTheme } from "styled-components";
import { CiSearch } from "react-icons/ci";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ClassDashboard = () => {
  const router = useRouter();
  const theme = useTheme();
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [creatingGroupIdx, setCreatingGroupIdx] = useState(null);
  const [groupCreateMsg, setGroupCreateMsg] = useState(null);
  const newClass = {
    id: 0,
    name: "Adicionar nova turma"
  };

  function handleNew() {
    router.push("/teacher/class/new");
  }

  // Função utilitária para buscar predominância
  function getPredominantIdx(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return -1;
    const max = Math.max(...arr);
    return arr.findIndex(v => v === max);
  }

  // Função para sugerir agrupamentos por inteligência E estilo
  function suggestGroups(students) {
    const map = {};
    students.forEach(aluno => {
      const intIdx = getPredominantIdx(aluno.intelligencePercentages);
      const styleIdx = getPredominantIdx(aluno.stylePercentages);
      if (intIdx === -1 || styleIdx === -1) return;
      // Remover agrupamentos cujo estilo é undefined
      if (typeof learningStyleLabels[styleIdx] === 'undefined') return;
      const key = `${intIdx}-${styleIdx}`;
      if (!map[key]) map[key] = [];
      map[key].push(aluno);
    });
    // Só recomenda grupos com mais de 1 aluno
    return Object.entries(map)
      .filter(([, alunos]) => alunos.length > 1)
      .map(([key, alunos]) => {
        const [intIdx, styleIdx] = key.split('-').map(Number);
        return {
          intIdx,
          styleIdx,
          alunos,
          label: `Inteligência: ${intelligenceLabels[intIdx]} + Estilo: ${learningStyleLabels[styleIdx]}`
        };
      });
  }

  // Busca alunos e turmas do professor
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Busca inteligências
        const resInt = await api.get("/learning/teacher-stats");
        // Busca estilos
        const resStyle = await api.get("/learning/teacher-stats?type=preferences");
        // Busca turmas
        const resClasses = await api.get(`/classes?name=`);
        // Monta lista de alunos com ambas as porcentagens
        const studentsInt = resInt.data.allStudents || [];
        const studentsStyle = resStyle.data.allStudents || [];
        // Junta por id
        const studentsMap = {};
        studentsInt.forEach(s => { studentsMap[s.id] = { ...s, intelligencePercentages: s.percentages }; });
        studentsStyle.forEach(s => {
          if (studentsMap[s.id]) studentsMap[s.id].stylePercentages = s.percentages;
        });
        const all = Object.values(studentsMap).filter(s => s.intelligencePercentages && s.stylePercentages);
        setAllStudents(all);
        setClasses(resClasses?.data?.classroom || []);
        // Recomendações
        setRecommendations(suggestGroups(all));
      } catch (e) {
        setAllStudents([]);
        setRecommendations([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Handler para criar turma
  async function handleCreateGroup(group, idx) {
    setGroupCreateMsg(null);
    setCreatingGroupIdx(idx);
    try {
      const studentIds = group.alunos.map(a => a.id);
      // Verifica se já existe turma com exatamente esses alunos
      const exists = classes.some(cls => {
        if (!cls.students || cls.students.length !== studentIds.length) return false;
        const clsIds = (cls.students || []).map(s => s.id).sort().join(',');
        const groupIds = [...studentIds].sort().join(',');
        return clsIds === groupIds;
      });
      if (exists) {
        setGroupCreateMsg({ success: false, text: 'Já existe uma turma com esses alunos.' });
        setRecommendations(prev => prev.filter((_, i) => i !== idx)); // Remove recomendação
        setCreatingGroupIdx(null);
        return;
      }
      // Cria turma
      const res = await api.post('/classes', {
        name: group.label,
        studentIds
      });
      setGroupCreateMsg({ success: true, text: 'Turma criada com sucesso!' });
      setClasses(prev => [...prev, res.data.classroom]);
      setRecommendations(prev => prev.filter((_, i) => i !== idx)); // Remove recomendação
    } catch (e) {
      setGroupCreateMsg({ success: false, text: 'Erro ao criar turma.' });
    }
    setCreatingGroupIdx(null);
  }

  useEffect(() => {
    async function fetchClasses() {
      const response = await api.get(`/classes?name=${search}`);
      const classes = response?.data?.classroom;
      setClasses(classes);
    }

    fetchClasses();
  }, [search]);

  useEffect(() => {
    const message = sessionStorage.getItem("messageStorage");
    if (message) {
      toast.success(message);
      sessionStorage.removeItem("messageStorage"); 
    }
  }, []);

  return (
    <Container>
      <Header/>
      <Input
        icon={CiSearch}
        placeholder={"Pesquise pela turma!"}
        width={"100%"}
        bgColor={theme.COLORS.WHITE}
        margin={"0 1.6rem"}
        onChange={(e => setSearch(e.target.value))}
      />
      <ContentContainer>
        {
          !search && (
            <ClassCard onClick={handleNew}
              data={newClass} 
            />
          )
        }
        {
          classes && classes.map(classroom => (
            <ClassCard
              key={classroom.id}
              data={classroom} 
            />
          ))
        }
      </ContentContainer>
      {/* Recomendações de agrupamento */}
      <div style={{ margin: '32px 0', background: '#f6f8fa', borderRadius: 16, boxShadow: '0 2px 8px rgba(41,128,185,0.08)', padding: 24 }}>
        <h2 style={{ color: '#222', marginBottom: 16 }}>Sugestões de turmas por inteligência e estilo predominante</h2>
        {loading ? <p>Carregando recomendações...</p> : (
          recommendations.length === 0 ? <p>Nenhum agrupamento significativo encontrado.</p> : (
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              {recommendations.map((group, idx) => (
                <li key={idx} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span><b>{group.label}:</b> {group.alunos.map(a => a.name).join(', ')}</span>
                  <button
                    style={{ marginLeft: 8, padding: '4px 14px', borderRadius: 8, background: '#27ae60', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 }}
                    disabled={creatingGroupIdx === idx}
                    onClick={() => handleCreateGroup(group, idx)}
                  >{creatingGroupIdx === idx ? 'Criando...' : 'Criar turma'}</button>
                </li>
              ))}
            </ul>
          )
        )}
        {groupCreateMsg && (
          <div style={{ marginTop: 16, color: groupCreateMsg.success ? '#27ae60' : '#c0392b', fontWeight: 'bold' }}>{groupCreateMsg.text}</div>
        )}
      </div>
    </Container>
  );
};

export default ClassDashboard;

// Labels para inteligência e estilo (pode ser importado de outro lugar se já existir)
const intelligenceLabels = [
  'Linguística', 'Lógico-matemática', 'Espacial', 'Corporal-cinestésica',
  'Musical', 'Interpessoal', 'Intrapessoal', 'Naturalista'
];
const learningStyleLabels = [
  'Ativo', 'Reflexivo', 'Teórico', 'Pragmático'
];

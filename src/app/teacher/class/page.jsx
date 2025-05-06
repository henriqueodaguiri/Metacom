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
  const newClass = {
    id: 0,
    name: "Adicionar nova turma"
  };

  function handleNew() {
    router.push("/teacher/class/new");
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
    </Container>
  );
};

export default ClassDashboard;

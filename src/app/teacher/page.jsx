"use client";
import { Container, ContentContainer, Logo } from "./styles";
import { Header } from "@/components/Header";

const Teacher = () => {
  return (
    <Container>
      <Header/>
      <ContentContainer>
        <Logo src="/favicon.png" alt="Logo"/>
        <h1>Gerencie turmas e leituras</h1>
      </ContentContainer>
    </Container>
  );
};

export default Teacher;

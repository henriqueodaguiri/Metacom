"use client";
import { useEffect, useState } from "react";
import { Container, ContentContainer, TextContainer, MessageContainer, Logo } from "./styles";
import { Header } from "@/components/Header";
import { UndoneText } from "@/components/UndoneText";
import { api } from "@/lib/api";

const Student = () => {
  const [undoneTexts, setUndoneTexts] = useState([]);

  useEffect(() => {
    async function fetchUndoneTexts() {
      const response = await api.get("/users/undoneTexts");
      setUndoneTexts(response.data.undoneTexts);
    }

    fetchUndoneTexts();
  }, []);

  return (
    <Container>
      <Header/>
      <ContentContainer>
        {
          (undoneTexts && undoneTexts.length > 0) 
          ? (
            <>
              <h1>Leituras pendentes</h1>
              <TextContainer>
                {
                  undoneTexts.map((t, i) => (
                    <UndoneText
                      key={i}
                      text={t}
                    />)
                  )
                }
              </TextContainer>
            </>
          ) 
          : (
            <MessageContainer>
              <Logo src="/favicon.png" alt="Logo"/>
              <h1>Aperfeiçoe sua leitura!</h1>
            </MessageContainer>
          )
        }
      </ContentContainer>
    </Container>
  );
};

export default Student;

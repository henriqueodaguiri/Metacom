"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Container, 
  ContentContainer, 
  BackButtonContainer,
  CoverContainer, 
  FieldsContainer, 
  ButtonsContainer,
  ModalContent, 
  ModalButtonsContent
} from "./styles";
import bookPlaceholder from "@/assets/book-placeholder.png"; 
import Image from "next/image";
import { Header } from "@/components/Header";
import { Options } from "@/components/Options";
import { ReadOnlyContent } from "@/components/ReadOnlyContent";
import { LoadingPage } from "@/components/LoadingPage";
import { Button } from "@/components/Button";
import { IoMdArrowRoundBack } from "react-icons/io";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import Modal from "react-modal";

const EditText = () => {
  const { classId, textId } = useParams(); 
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState({}); 
  const [done, setDone] = useState(false); 
  const [grade, setGrade] = useState(null);
  const [coverUrl, setCoverUrl] = useState(bookPlaceholder); 
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleSubmit() {
    for(let question of questions) {
      if(!question.selectedChoiceId) {
        toast.error("Responda todas as perguntas!");
        return;
      }
    }
    setIsModalOpen(true);
  }

  async function confirmSubmit() {
    try {
      setIsModalOpen(false);
      await api.post(`/classText/${classId}/${textId}`, {
        questions
      });
      toast.success("Respondido com sucesso!", {
        onClose: () => {
          window.location.reload();
        },
        autoClose: 1500, 
      });
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Não foi possível atualizar");
      }
    } 
  }

  useEffect(() => {
    Modal.setAppElement("#__next");
    
    async function fetchText() {
      try {
        const result = await api.get(`/classText/${classId}/${textId}`);
        const grade = result?.data?.classText?.grade;
        const text = result?.data?.classText?.text;
        const questions = result?.data?.classText?.questions;

        setDone(grade != null);
        setGrade(grade);
        setText(text);
        setCoverUrl(text.coverUrl || bookPlaceholder); 
        setQuestions(questions);
      } catch {
        router.push("/");
      }
    }

    fetchText();
  }, [textId]);

  return (
    <Container>
      {loading && <LoadingPage />}
      <Header />
      <ContentContainer $grade={grade}>
        <h1>{text.name}</h1>
        {
          done && (
            <h2>Nota: <span>{grade}</span></h2>
          )
        }
        <BackButtonContainer onClick={() => router.back()}>
          <IoMdArrowRoundBack size={60}/>
        </BackButtonContainer>
        <CoverContainer>
          {coverUrl && ( 
            <Image
              src={coverUrl}
              alt="Capa do livro"
              fill
              quality={100}
              priority
            />
          )}
        </CoverContainer>
        <FieldsContainer>
          <ReadOnlyContent content={text.content || ""} />
        </FieldsContainer>
      </ContentContainer>
      {
        questions && questions.length > 0 && (
          <ContentContainer>
            <h2>Perguntas</h2>
            <FieldsContainer>
              <Options
                done={done}
                questions={questions}
                setQuestions={setQuestions}
              />
            </FieldsContainer>
          </ContentContainer>
        )
      }
      {
        !done && (
          <ButtonsContainer>
            <Button
              title={"Enviar"}
              width={"100%"}
              maxWidth={"800px"}
              onClick={handleSubmit}
            />
          </ButtonsContainer>
        )
      }
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Confirm Submit"
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
              borderRadius: "20px", 
            },
          }}
        >
          <ModalContent>
            <h2>Deseja mesmo enviar? Uma vez enviado não há como refazer.</h2>
            <ModalButtonsContent>
              <Button title={"Sim"} width={"100%"} onClick={confirmSubmit} />
              <Button title={"Não"} width={"100%"} onClick={() => setIsModalOpen(false)} />
            </ModalButtonsContent>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default EditText;

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Container, 
  CameraContainer, 
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
import { Input } from "@/components/Input";
import { Questions } from "@/components/Questions";
import { TextEditor } from "@/components/TextEditor";
import { LoadingPage } from "@/components/LoadingPage";
import { Button } from "@/components/Button";
import { SelectInput } from "@/components/SelectInput";
import { FaCamera } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import Modal from "react-modal";
import { useTheme } from "styled-components";

const EditText = () => {
  const theme = useTheme();
  const { id } = useParams(); 
  const router = useRouter();
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState(0);
  const [title, setTitle] = useState(""); 
  const [content, setContent] = useState(""); 
  const [difficulties, setDifficulties] = useState([
    { id: 0, name: "SELECIONE A DIFICULDADE" },
    { id: "VERY_EASY", name: "MUITO FÁCIL" },
    { id: "EASY", name: "FÁCIL" },
    { id: "REGULAR", name: "MÉDIO" },
    { id: "HARD", name: "DIFÍCIL" },
    { id: "VERY_HARD", name: "MUITO DIFÍCIL" }
  ]);
  const [newCover, setNewCover] = useState("");
  const [coverUrl, setCoverUrl] = useState(bookPlaceholder); 
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    Modal.setAppElement("#__next");
    
    async function fetchText() {
      if(id === "new") {
        setIsNew(true);
        return;
      }

      try {
        const result = await api.get(`/texts/${id}`);
        const text = result?.data?.text.text;
        const questions = result?.data?.text.questions;

        setTitle(text.name); 
        setContent(text.content); 
        setDifficulty(text.difficulty); 
        setQuestions(text.questions); 
        setCoverUrl(text.coverUrl || bookPlaceholder); 
        setQuestions(questions);
        setIsNew(false);
      } catch {
        router.push("/teacher/text");
      }
    }

    fetchText();
  }, [id]);

  function handleAvatarChange(event) {
    const file = event.target.files[0];
    setNewCover(file);

    const newCover = URL.createObjectURL(file);
    setCoverUrl(newCover);
  }

  async function confirmDelete() {
    try {
      await api.delete(`/texts/${id}`);
      sessionStorage.setItem("messageStorage", "Excluído com sucesso!");
      router.push("/teacher/text");
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Não foi possível excluir");
      }
    }
    setIsModalOpen(false);
  }

  async function handleDelete() {
    setIsModalOpen(true);
  }

  async function uploadCover(id) {
    const fileUploadForm = new FormData();
    fileUploadForm.append("cover", newCover);
    const response = await api.patch(`/texts/cover/${id}`, fileUploadForm);
    return response.data.cover;
  }

  async function handleSave() {
    if (!title || !difficulty || !content) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (!questions || questions.length === 0) {
      toast.error("Insira perguntas!");
      return;
    }

    setLoading(true);
    try {
      let textId = id;
      if(isNew) {
        const response = await api.post("/texts", {
          name: title,
          difficulty,
          content,
          questions
        });
  
        textId = response.data.id;
      } else {
        await api.put(`/texts/${textId}`, {
          name: title,
          difficulty,
          content,
          questions
        });
      }

      if (newCover) {
        await uploadCover(textId);
      }

      sessionStorage.setItem("messageStorage", `${isNew ? "Cadastrado" : "Atualizado"} com sucesso!`);
      router.push("/teacher/text");
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Não foi possível atualizar");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      {loading && <LoadingPage />}
      <Header />
      <ContentContainer>
        <h1>Dados da Leitura</h1>
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
          <CameraContainer htmlFor="avatar">
            <input type="file" id="avatar" onChange={handleAvatarChange} />
            <FaCamera size={30} />
          </CameraContainer>
        </CoverContainer>
        <FieldsContainer>
          <Input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <SelectInput
            items={difficulties}
            selectedOption={difficulty}
            setSelectedOption={setDifficulty}
          />
          <TextEditor
            value={content}
            onChange={setContent}
          />
        </FieldsContainer>
      </ContentContainer>

      <ContentContainer>
        <h2>Perguntas</h2>
        <FieldsContainer>
          <Questions
            questions={questions}
            setQuestions={setQuestions}
          />
        </FieldsContainer>
      </ContentContainer>
      <ButtonsContainer>
        <Button
          title={"Salvar"}
          width={"100%"}
          maxWidth={"800px"}
          onClick={handleSave}
        />
        {
          !isNew && (
            <Button
              title={"Excluir"}
              width={"100%"}
              maxWidth={"800px"}
              onClick={handleDelete}
              bgColor={theme.COLORS.DARK_RED}
            />
          )
        }
      </ButtonsContainer>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Confirm Deletion"
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
            <h2>Deseja mesmo excluir?</h2>
            <ModalButtonsContent>
              <Button title={"Sim"} width={"100%"} onClick={confirmDelete} />
              <Button title={"Não"} width={"100%"} onClick={() => setIsModalOpen(false)} />
            </ModalButtonsContent>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default EditText;

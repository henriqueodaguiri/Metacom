"use client";
import { useEffect, useState } from "react";
import { 
  Container, 
  ContentContainer, 
  ModalContent, 
  ModalButtonsContent, 
  AccessKeyContainer,
  AccessKeyWrapper} from "./styles";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ClassCard } from "@/components/ClassCard";
import { api } from "@/lib/api";
import { useTheme } from "styled-components";
import { CiSearch } from "react-icons/ci";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { FaRegPaste } from "react-icons/fa6";

const ClassDashboard = () => {
  const router = useRouter();
  const theme = useTheme();
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const newClass = {
    id: 0,
    name: "Ingressar em nova turma"
  };

  function handleNew() {
    setIsModalOpen(true);
  }

  async function handlePasteAccessKey() {
    try {
      const text = await navigator.clipboard.readText();
      setAccessKey(text);
    } catch (error) {
      console.error("Falha ao acessar a área de transferência: ", error);
    }
  }

  async function joinClass() {
    try {
      await api.post("/classes/join", {
        accessKey
      });
      toast.success("Você ingressou na nova turma!");
      await fetchClasses();
      closeModal();
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Não foi possível ingressar");
      }
    }
  }

  async function fetchClasses() {
    const response = await api.get(`/classes?name=${search}`);
    const classes = response?.data?.classroom;
    setClasses(classes);
  }

  function closeModal() {
    setAccessKey("");
    setIsModalOpen(false);
  }

  useEffect(() => {
    Modal.setAppElement("#__next");
    fetchClasses();
  }, [search]);

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
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Join new Class"
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
              backgroundColor: "#FFF"
            },
          }}
        >
          <ModalContent>
            <h2>Informe a chave de acesso para ingressar em uma nova turma!</h2>
            <AccessKeyContainer>
                <AccessKeyWrapper>
                  <Input
                    placeholder={"Chave de acesso"}
                    width={"100%"}
                    bgColor={"transparent"}
                    border={"none"}
                    onChange={(e => setAccessKey(e.target.value))}
                    value={accessKey}
                  />
                  <FaRegPaste size={60} onClick={handlePasteAccessKey} />
                </AccessKeyWrapper>
              </AccessKeyContainer>
            <ModalButtonsContent>
              <Button title={"Ingressar"} width={"100%"} onClick={joinClass} />
              <Button title={"Cancelar"} width={"100%"} onClick={closeModal} />
            </ModalButtonsContent>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ClassDashboard;

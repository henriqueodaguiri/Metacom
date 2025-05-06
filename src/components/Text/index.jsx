"use client";
import { 
  Container, 
  CoverContainer, 
  TextContainer, 
  ModalContent,
  ModalButtonsContent
} from "./styles";
import Image from "next/image";
import { FaTrashAlt } from "react-icons/fa";
import textPlaceholder from "@/assets/book-placeholder.png";
import { Button } from "../Button";
import Modal from "react-modal";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/context/auth";
import roles from "@/lib/roles";
import { useRouter } from "next/navigation";

export function Text({ index, text, updateClassroom, classroom }) {
  const router = useRouter();
  const textCover = text?.coverUrl ? `${text.coverUrl}` : textPlaceholder;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getAuthUser } = useAuth();
  const [user, setUser] = useState(null);

  function handleTextClick() {
    if(user?.role === roles.STUDENT) {
      router.push(`/student/text/${classroom.id}/${text.id}`);
    } 
  }

  function handleEditText() {
    if(user?.role === roles.TEACHER) {
      router.push(`/teacher/text/${text.id}`);
    } 
  }

  async function confirmDelete() {
    const textIdToRemove = text.id; 

    try {
      await api.delete(`/classes/${classroom.id}/text/${textIdToRemove}`);
      updateClassroom();
      toast.success("Excluído com sucesso!");
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

  useEffect(() => {
    Modal.setAppElement("#__next");

    async function fetchUser() {
      const user = await getAuthUser();
      setUser(user);
    }

    fetchUser();
  }, []);

  return (
    <Container 
      $index={index}
      className={user?.role === roles.STUDENT ? "student" : ""}
      onClick={handleTextClick}
    >
      <TextContainer
        $grade={text.grade}
      >
        {
          !(text.grade === undefined || text.grade === null) && (
            <h1>{text.grade}</h1>
          )
        }
        <CoverContainer>
          <Image
            src={textCover} 
            alt={`Foto de ${text.name}`}
            fill 
            quality={100}
            priority
            onClick={handleEditText}
          />
        </CoverContainer>
        <p>{text.name}</p>
        {
          user?.role === roles.TEACHER && (
            <FaTrashAlt onClick={handleDelete}/> 
          )
        }
      </TextContainer>
      {
      isModalOpen && (
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
}


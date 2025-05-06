"use client";
import { 
  Container, 
  AvatarContainer, 
  ToggleButton, 
  StudentContainer, 
  ContentContainer, 
  PerformanceContainer, 
  Performance,
  ModalContent,
  ModalButtonsContent
} from "./styles";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaTrashAlt } from "react-icons/fa";
import studentPlaceholder from "@/assets/user.png";
import { Button } from "../Button";
import Modal from "react-modal";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-toastify";

export function Student({ index, student, setClassroom, classroom, texts }) {
  const [showPerformance, setShowPerformance] = useState(false);
  const studentAvatarUrl = student?.avatarUrl ? `${student.avatarUrl}` : studentPlaceholder;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [undoneTexts, setUndoneTexts] = useState([]);

  async function confirmDelete() {
    const studentIdToRemove = student.id; 

    const updatedClassroom = {
      ...classroom,
      students: classroom.students.filter(student => student.id !== studentIdToRemove)
    };

    try {
      await api.delete(`/classes/${classroom.id}/student/${studentIdToRemove}`);
      setClassroom(updatedClassroom); 
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
    const undoneTexts = texts.filter(t => !student.performances.map(x => x.text.id).includes(t.id));
    setUndoneTexts(undoneTexts);
  }, [texts]);

  return (
    <Container $index={index}>
      <StudentContainer>
        <ContentContainer $grade={student.grade}>
          <AvatarContainer>
            <Image
              src={studentAvatarUrl} 
              alt={`Foto de ${student.name}`}
              fill 
              quality={100}
              priority
            />
          </AvatarContainer>
          <p>
            {student.name} {student.grade && "- Nota: "}
            {student.grade && <span>{student.grade}</span>}
          </p>
        </ContentContainer>
        <ContentContainer>
          {
            student.performances && 
            student.performances.length > 0 && (
              <ToggleButton onClick={() => setShowPerformance(!showPerformance)}>
                {showPerformance ? <FaEyeSlash /> : <FaEye />}
              </ToggleButton>
            )
          }
          <FaTrashAlt onClick={handleDelete}/> 
        </ContentContainer>
      </StudentContainer>
      {
          showPerformance && 
          student.performances && 
          student.performances.length > 0 && (
            <PerformanceContainer $index={index}>
              {
                student.performances.map((p, i) => 
                  (
                    <Performance
                      key={i}
                      $index={index}
                      $grade={p.grade}
                    >
                      <p>{p.text.name}</p>
                      <p><span>{p.grade}</span></p>
                    </Performance>
                  )
                )
              }
              {
                undoneTexts && undoneTexts.length > 0 && undoneTexts.map((t, i) =>
                  <Performance
                    key={i}
                    $index={index}
                    $grade={0}
                  >
                    <p>{t.name}</p>
                    <p><span>Pendente</span></p>
                  </Performance>
                )
              }
            </PerformanceContainer>
          )
      }
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


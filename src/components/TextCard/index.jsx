"use client";
import { useState, useEffect } from "react";
import { 
  HeaderContainer, 
  Header, 
  CoverContainer, 
  CardContainer } from "./styles";
import bookPlaceholder from "@/assets/book-placeholder.png";
import addPlaceholder from "@/assets/add.png";
import Image from "next/image";
import { FaPencilAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

export function TextCard({ data, onClick }) {
  const router = useRouter();
  const [cover, setCover] = useState(bookPlaceholder);

  useEffect(() => {
    if (data.id === 0) {
      setCover(addPlaceholder);
      return;
    }

    if (data?.coverUrl) {
      setCover(data.coverUrl);
      return;
    }

    setCover(bookPlaceholder);
  }, []);

  return (
    <>
      {data && (
        <CardContainer>
          <HeaderContainer $newText={data.id === 0}>
            <Header>
              <h1>{data.name}</h1>
              {
                data.id !== 0 && (
                  <FaPencilAlt onClick={() => router.push(`/teacher/text/${data.id}`)} />
                )
              }
            </Header>
          </HeaderContainer>
          <CoverContainer onClick={onClick} $newText={data.id === 0}>
            <Image
              src={cover}
              alt={`${data.name}`}
              fill
              quality={100}
              priority
            />
          </CoverContainer>
          {data.id !== 0&& <p>Dificuldade: {data.difficulty}</p>}
        </CardContainer>
      )}
    </>
  );
}

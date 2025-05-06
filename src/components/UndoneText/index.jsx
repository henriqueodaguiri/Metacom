"use client";
import { 
  CoverContainer, 
  TextContainer, 
} from "./styles";
import Image from "next/image";
import textPlaceholder from "@/assets/book-placeholder.png";
import { useRouter } from "next/navigation";

export function UndoneText({ index, text }) {
  const router = useRouter();
  const textCover = text?.coverUrl ? `${text.coverUrl}` : textPlaceholder;

  function handleTextClick() {
    router.push(`/student/text/${text.classId}/${text.id}`);
  }

  return (
    <TextContainer
      $grade={text.grade}
      $index={index}
      onClick={handleTextClick}
    >
      <CoverContainer>
        <Image
          src={textCover} 
          alt={`Foto de ${text.name}`}
          fill 
          quality={100}
          priority
        />
      </CoverContainer>
      <p>{text.name}</p>
      <p>{text.className}</p>
    </TextContainer>
  );
}


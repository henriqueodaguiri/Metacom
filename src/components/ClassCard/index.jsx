"use client";
import { useState, useEffect } from "react";
import { 
  HeaderContainer, 
  Header, 
  CoverContainer, 
  CardContainer } from "./styles";
import classPlaceholder from "@/assets/class-placeholder.png";
import addPlaceholder from "@/assets/add.png";
import Image from "next/image";
import { FaPencilAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import roles from "@/lib/roles";

export function ClassCard({ data, onClick }) {
  const router = useRouter();
  const [cover, setCover] = useState(classPlaceholder);
  const [user, setUser] = useState(null);
  const { getAuthUser } = useAuth();

  function handleCardClick() {
    if(user?.role === roles.STUDENT) {
      router.push(`/student/class/${data.id}`);
    }
  }

  useEffect(() => {
    if (data.id === 0) {
      setCover(addPlaceholder);
      return;
    }

    async function fetchUser() {
      const user = await getAuthUser();
      setUser(user);
    }

    fetchUser();
  }, []);

  return (
    <>
      {data && (
        <CardContainer 
          onClick={handleCardClick}
          className={user?.role === roles.STUDENT ? "student" : ""}
        > 
          <HeaderContainer $new={data.id === 0}>
            <Header>
              <h1>{data.name}</h1>
              {
                user?.role === roles.TEACHER &&
                data.id !== 0 && 
                  (
                  <FaPencilAlt onClick={() => router.push(`/teacher/class/${data.id}`)} />
                )
              }
            </Header>
          </HeaderContainer>
          <CoverContainer 
            onClick={onClick} $new={data.id === 0}
            $student={user?.role === roles.STUDENT}
          >
            <Image
              src={cover}
              alt={`${data.name}`}
              fill
              quality={100}
              priority
            />
          </CoverContainer>
        </CardContainer>
      )}
    </>
  );
}

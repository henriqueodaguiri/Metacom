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
  return (
    <Container>
      <Header/>
      <ContentContainer>
      
      </ContentContainer>
    </Container>
  );
};

export default ClassDashboard;

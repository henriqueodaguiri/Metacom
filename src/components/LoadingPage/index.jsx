"use client";
import { Container } from "./styles";
import { Spinner } from "@/components/Spinner";

export function LoadingPage() {
 return (
  <Container>
     <Spinner />
  </Container>
 );
}
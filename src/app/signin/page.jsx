"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Container, WallpaperContainer, LoginContainer } from "./styles";
import { useAuth } from "@/context/auth";
import hero from "@/assets/hero.png";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import Link from "next/link";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  async function handleLogin() {
    const user = await login(email, password);
    if (user) {
      window.location.href = "/";
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        handleLogin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [email, password]);

  return (
    <Container>
      <WallpaperContainer>
      <Image
          src={hero}
          alt="Hero Image"
          fill
          quality={100}
          priority
        />
      </WallpaperContainer>
      <LoginContainer>
        <h1>Faça Login</h1>
        <Input 
          icon={MdEmail}
          placeholder="E-mail"
          type="email"
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          icon={RiLockPasswordFill}
          placeholder="Senha"
          type="password" 
          onChange={e => setPassword(e.target.value)}
        />
        
        <Button
          title={"Entrar"}
          onClick={handleLogin}
          width={"100%"}
        />

        <Link href="/signup">
          Criar uma conta
        </Link>
      </LoginContainer>
    </Container>
  );
};

export default SignIn;

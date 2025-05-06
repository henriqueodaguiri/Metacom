"use client";
import { useAuth } from "@/context/auth";
import { useEffect, useState } from "react";
import { Container, UserContainer, AvatarContainer, CameraContainer } from "./styles";
import { Header } from "@/components/Header";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { LoadingPage } from "@/components/LoadingPage";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaCamera } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import Image from "next/image";
import userPlaceholder from "@/assets/user.png";
import { toast } from "react-toastify";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const User = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const { user, setUser } = useAuth();
  const [newAvatar, setNewAvatar] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(userPlaceholder);

  function handleAvatarChange(event) {
    const file = event.target.files[0];
    setNewAvatar(file);

    const newAvatarPreview = URL.createObjectURL(file);
    setAvatarUrl(newAvatarPreview);
  }

  async function uploadAvatar() {
    const fileUploadForm = new FormData();
    fileUploadForm.append("avatar", newAvatar);
    const response = await api.patch("/users/avatar", fileUploadForm);
    return response.data.avatar;
  }

  async function handleSaveChanges() {
    if (!name || !email) {
      toast.error("Nome e e-mail são obrigatórios!");
      return false;
    }

    if ((oldPassword && (!newPassword || !confirmNewPassword)) ||
        (!oldPassword && (newPassword || confirmNewPassword))) {
      toast.error("Para redefinir a senha, informe a senha antiga e a nova!");
      return false;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("As senhas não conferem!");
      return false;
    }

    setLoading(true);
    try {
      await api.put("/users", {
        name,
        email,
        old_password: oldPassword,
        new_password: newPassword
      });

      if(newAvatar) {
        const avatarFileName = await uploadAvatar();
        user.avatarUrl = avatarFileName;
      }
      
      user.name = name;
      user.email = email;
      localStorage.setItem("@meta-reading:user", JSON.stringify(user));
      setUser(user);
      toast.success("Atualizado com sucesso!", {
        onClose: () => {
          router.push("/");
        },
        autoClose: 1500, 
      });
    } catch(error) {
      console.log(error);
      const errorMessage = error.response?.data?.message;
      if(errorMessage){
        toast.error(errorMessage);
      } else {
        toast.error("Não foi possível atualizar");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if(user) {
      setName(user.name);  
      setEmail(user.email);        
      setAvatarUrl(user?.avatarUrl ? `${user.avatarUrl}` : userPlaceholder);
    }
  }, [user]);

  return (
    <>
      {
        loading && (
          <LoadingPage/>
        )
      }
      <Container>
        <Header/>
        {
          user && (
            <UserContainer>
              <AvatarContainer>
                <Image
                  src={avatarUrl} 
                  alt="Avatar" 
                  fill 
                  quality={100}
                  priority
                />
                <CameraContainer htmlFor="avatar">
                  <input type="file" id="avatar" onChange={handleAvatarChange}/>
                  <FaCamera size={32}/>
                </CameraContainer>
              </AvatarContainer>
              <Input
                icon={FaUser}
                placeholder="Nome"
                type="text"
                onChange={e => setName(e.target.value)}
                value={name}  
              />
              <Input 
                icon={MdEmail}
                placeholder="E-mail"
                type="email"
                onChange={e => setEmail(e.target.value)}
                value={email}  
              />
              <Input
                icon={RiLockPasswordFill}
                placeholder="Senha antiga"
                type="password"
                onChange={e => setOldPassword(e.target.value)}
              />
              <Input
                icon={RiLockPasswordFill}
                placeholder="Nova senha"
                type="password"
                onChange={e => setNewPassword(e.target.value)}
              />
              <Input
                icon={RiLockPasswordFill}
                placeholder="Confirmar nova senha"
                type="password"
                onChange={e => setConfirmNewPassword(e.target.value)}
              />
              <Button
                title={"Salvar"}
                onClick={handleSaveChanges}
                width={"100%"}
              />
            </UserContainer>
          )
        }
      </Container>  
    </>
  );
};

export default User;

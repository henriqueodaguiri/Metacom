"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  async function login(email, password) {
    try {
      const response = await api.post("/session", { email, password });
      const { user } = response.data; 

      delete user.password;
      delete user.role;
      localStorage.setItem("@meta-reading:user", JSON.stringify(user));
      setUser(user);

      return user;
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message;
      if(errorMessage){
        toast.error(errorMessage);
      } else {
        toast.error("Não foi possível logar");
      }
    }
  }

  async function logout() {
    setUser(null);
    await api.delete("/session");
    localStorage.removeItem("@meta-reading:user");
  }

  async function getAuthUser() {
    try {
      const response = await api.get("/session");
      return response.data.user;
    } catch (error) {
      localStorage.removeItem("@meta-reading:user");
      setUser(null);
      router.push("/signin");
    }
  }

  useEffect(() => {
    const user = localStorage.getItem("@meta-reading:user");
    if (user) {
      setUser(JSON.parse(user));
    }
  }, []);

  return (
    <AuthContext.Provider value={{user, setUser, login, logout, getAuthUser }}>
      { children }
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
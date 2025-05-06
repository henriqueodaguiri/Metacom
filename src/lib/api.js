"use client";
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    if (response.status === 401) {
      localStorage.removeItem("@meta-reading:user");
    }

    return Promise.reject(error);
  }
);
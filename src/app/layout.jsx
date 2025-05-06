"use client";
import { ThemeProvider } from "styled-components";
import GlobalStyle from "@/styles/global";
import theme from "@/styles/theme";
import { AuthProvider } from "@/context/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <title>Meta Leitura</title>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <div id="__next">
          <ThemeProvider theme={theme}>
            <ToastContainer />
            <AuthProvider>
              <GlobalStyle />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
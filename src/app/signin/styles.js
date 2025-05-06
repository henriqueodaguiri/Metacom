"use client";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

export const WallpaperContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh; 
  overflow: hidden; 
`;

export const LoginContainer = styled.div`
  min-width: 400px;
  margin: 0 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 4rem;
  background-color: ${({ theme }) => theme.COLORS.WHITE };
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);

  > button {
    margin-top: 2rem;
  }
`;

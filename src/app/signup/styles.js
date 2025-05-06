"use client";
import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: grid;
  place-content: center;
`;

export const SignUpContainer = styled.div`
  background-color: ${({ theme }) => theme.COLORS.WHITE };
  padding: 4rem;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  > button {
    margin-top: 2rem;
  }
`;

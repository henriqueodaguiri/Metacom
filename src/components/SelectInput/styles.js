"use client";
import styled from "styled-components";

export const Container = styled.div`
  background-color: ${({ theme }) => theme.COLORS.LIGHT };
  padding: ${({ $padding }) => $padding || "1.2rem 1.6rem" };
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  width: ${({ $width }) => $width || "100%" };
  border: 2px solid ${({ theme }) => theme.COLORS.PURPLE};

  > select {
    background-color: transparent;
    border: none;
    width: 100%;
  }
`;
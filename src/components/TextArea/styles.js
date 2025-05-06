"use client";
import styled from "styled-components";

export const Container = styled.textarea`
  width: 100%;
  background-color: ${({ $bgColor, theme }) => $bgColor || theme.COLORS.LIGHT };
  border: 2px solid ${({ theme }) => theme.COLORS.PURPLE};
  border-radius: 8px;
  padding: 1.6rem;
  height: 100%;
  resize: vertical;
`;

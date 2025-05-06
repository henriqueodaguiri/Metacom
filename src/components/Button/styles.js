"use client";
import styled from "styled-components";

export const Container = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  padding: ${({ $padding }) => $padding || "2rem" };
  border-radius: 20px;
  background-color: ${({ theme, $bgColor }) => $bgColor || theme.COLORS.PURPLE};
  width: ${({ $width }) => $width || "auto" };
  max-width: ${({ $maxWidth }) => $maxWidth || "auto" };
`;

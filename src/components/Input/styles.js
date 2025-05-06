"use client";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ $bgColor, theme }) => $bgColor || theme.COLORS.LIGHT };
  margin: ${({ $margin }) => $margin || 0 };
  border: ${({ $border, $borderColor, theme }) => 
    $border 
      ? $border 
      : `2px solid ${$borderColor || theme.COLORS.PURPLE}`
  };
  border-radius: 20px;
  padding: 1.6rem;
`;

export const InputElement = styled.input`
  background-color: transparent;
  border: none;
  padding-left: 0.8rem;
  width: ${({ $width }) => $width || "auto" };
  width: 100%;
`;
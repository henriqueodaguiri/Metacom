"use client";
import styled from "styled-components";

export const Container = styled.div`
  .ql-container {
    border-radius: 8px;
    border: 2px solid ${({ theme }) => theme.COLORS.PURPLE};
    background-color: ${({ theme }) => theme.COLORS.LIGHT};
    height: 24rem;
  }
`;

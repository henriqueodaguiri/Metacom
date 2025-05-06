"use client";
import styled from "styled-components";

export const ContentDisplay = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.COLORS.LIGHT};
  border: 2px solid ${({ theme }) => theme.COLORS.PURPLE};
  border-radius: 8px;
  padding: 1.6rem;
  min-height: 200px;
  overflow-y: auto;

  p {
    margin: 1rem 0;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1rem 0;
  }

`;
"use client";
import styled from "styled-components";


export const TextContainer = styled.div`
  background-color: ${({ theme }) => theme.COLORS.LIGHT };
  border-radius: 20px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 240px;
  height: 280px;
  
  cursor: pointer;
  svg {
    cursor: pointer;
  }

  p:first-of-type{
    font-weight: 500;
  }
`;

export const CoverContainer = styled.div`
  width: 16rem;
  height: 18rem;
  position: relative;
  margin-bottom: 0.8rem;
  cursor: pointer;

  > img {
    border-radius: 8px;
  }
`;

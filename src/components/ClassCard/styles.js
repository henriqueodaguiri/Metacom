"use client";
import styled from "styled-components";

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: 1.6rem;
  border-radius: 20px;
  overflow: hidden; 
  background-color: ${({ theme }) => theme.COLORS.WHITE };
  width: 240px;
  height: 240px;

  &.student {
    cursor: pointer;
  }

  > p {
    margin: 0.8rem 0;
  }
`;

export const HeaderContainer = styled.div`
  width: 100%;
  background-color: ${({ theme, $new }) => $new ? theme.COLORS.PURPLE : theme.COLORS.DARK_BLUE };
  display: flex;
  justify-content: center;
`;

export const Header = styled.div`
  position: relative;
  width: 100%;
  padding: 1.6rem 2.4rem;
  text-align: center;
  color: ${({ theme }) => theme.COLORS.WHITE };

  > h1 {
    color: ${({ theme }) => theme.COLORS.WHITE };
    font-size: 2.4rem;
  }

  > svg {
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
    color: ${({ theme }) => theme.COLORS.WHITE };

    &:hover {
      filter: brightness(0.9);
    }
  }
`;

export const CoverContainer = styled.div`
  width: ${({ $new }) => $new ? "8rem" : "18rem" }; 
  height: ${({ $new }) => $new ? "8rem" : "20rem" }; 
  position: relative;

  > img {
    cursor: ${({ $new, $student }) => ($new || $student) ? "pointer" : "default" };
    border-radius: 20px;
    margin-top: ${({ $new }) => $new ? "3.2rem" : "0" }; 
  }
`;

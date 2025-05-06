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
  width: 260px;
  height: 280px;

  > p {
    margin: 0.8rem 0;
  }
`;

export const HeaderContainer = styled.div`
  width: 100%;
  background-color: ${({ theme, $newText }) => $newText ? theme.COLORS.PURPLE : theme.COLORS.DARK_BLUE };
  display: flex;
  justify-content: center;
`;

export const Header = styled.div`
  width: 100%;
  padding: 1.6rem 2.4rem;
  color: ${({ theme }) => theme.COLORS.WHITE };
  display: flex;
  justify-content: space-between; 
  align-items: center;

  > h1 {
    color: ${({ theme }) => theme.COLORS.WHITE };
    font-size: 2.4rem;
    flex: 1; 
    text-align: center;
    word-wrap: break-word; 
    word-break: break-word;
  }

  > svg {
    cursor: pointer;
    color: ${({ theme }) => theme.COLORS.WHITE };

    &:hover {
      filter: brightness(0.9);
    }
  }
`;

export const CoverContainer = styled.div`
  width: ${({ $newText }) => $newText ? "8rem" : "16rem" }; 
  height: ${({ $newText }) => $newText ? "8rem" : "20rem" }; 
  position: relative;
  margin: 0.8rem 0;

  > img {
    cursor: ${({ $newText }) => $newText ? "pointer" : "default" };
    border-radius: 20px;
    margin-top: ${({ $newText }) => $newText ? "4.2rem" : "0" }; 
  }
`;

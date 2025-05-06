"use client";
import styled from "styled-components";

export const Container = styled.header`
  width: 100%;
  background-color: ${({ theme }) => theme.COLORS.WHITE};
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  padding: 0.8rem 4rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  button {
    transition: none;
    color: ${({ theme }) => theme.COLORS.BLACK};
  }

  button:hover {
    background-color: ${({ theme }) => theme.COLORS.PURPLE};
    color: ${({ theme }) => theme.COLORS.WHITE};
    filter: brightness(1);

    > svg {
      color: ${({ theme }) => theme.COLORS.WHITE};
    }
  }
`;

export const MainContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8rem;

  h1 {
    font-size: 3.6rem;
    cursor: pointer;
  }
`;

export const OptionsContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rem;
`;

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4rem;
`;

export const Logo = styled.img`
  width: 6rem;
  height: 6rem;
  cursor: pointer;
`;

export const AvatarContainer = styled.div`
  width: 6rem;
  height: 6rem;
  position: relative;
  cursor: pointer;

  > img {
    border-radius: 50%;
  }
`;
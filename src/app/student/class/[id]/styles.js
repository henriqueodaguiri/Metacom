"use client";
import styled from "styled-components";

export const Container = styled.div`
  > div {
    margin-top: 2rem;
  } 
`;

export const ContentHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: center;
  gap: 1.6rem;
  max-width: 800px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.COLORS.WHITE };
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  padding: 2rem;
  position: relative;

  h2 {
    margin-bottom: 2rem;
  }

  span {
    color: ${({ theme, $grade }) => Number($grade) >= 6 ? theme.COLORS.GREEN : theme.COLORS.DARK_RED };
  }
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; 
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.COLORS.WHITE };
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  padding: 2rem;

  h1, h2 {
    margin-bottom: 4rem;
  }

  &:last-child {
    margin-bottom: 4rem;
  }
`;


export const BackButtonContainer = styled.div`
  position: absolute;
  cursor: pointer;
  padding: 0.4rem;
  top: 16px;
  left: 16px;
  background-color: ${({ theme }) => theme.COLORS.PURPLE };
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  > svg {
    color: ${({ theme }) => theme.COLORS.WHITE};
  }
`;

export const ItensContainer = styled.div`
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  border: 2px solid ${({ theme }) => theme.COLORS.LIGHT_GREY };
`;

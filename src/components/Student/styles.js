"use client";
import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  background-color: ${({ theme, $index }) => $index % 2 === 0 ? theme.COLORS.LIGHT_GREY : theme.COLORS.WHITE };
  padding: 1.6rem;

  svg {
    cursor: pointer;
  }

  svg:hover {
    color: ${({ theme }) => theme.COLORS.PURPLE};
  }
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

export const ToggleButton = styled.button`
  background: none;
`;

export const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;

  > p {
    text-transform: uppercase;
    font-weight: 500;
  }

  span {
    color: ${({ theme, $grade }) => Number($grade) >= 6 ? theme.COLORS.GREEN : theme.COLORS.DARK_RED };
    font-weight: 600;
  }
`;

export const StudentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PerformanceContainer = styled.div`
  margin-top: 0.8rem;
  border-radius: 8px;
  border: 2px solid ${({ theme, $index }) => $index % 2 === 0 ? theme.COLORS.WHITE : theme.COLORS.LIGHT_GREY };
  overflow: hidden;
`;

export const Performance = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.8rem;

  &:not(:first-child) {
    border-top: 2px solid ${({ theme, $index }) => $index % 2 === 0 ? theme.COLORS.WHITE : theme.COLORS.LIGHT_GREY };
  }  
  
  p > span {
    color: ${({ theme, $grade }) => Number($grade) >= 6 ? theme.COLORS.GREEN : theme.COLORS.DARK_RED };
    font-weight: 500;
  }
`;


export const ModalContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2rem;
`;

export const ModalButtonsContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: 100%;

  > button {
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);

    &:first-child {
      background-color: ${({ theme }) => theme.COLORS.DARK_RED}
    }
  }
`;
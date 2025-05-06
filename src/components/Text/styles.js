"use client";
import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  background-color: ${({ theme, $index }) => $index % 2 === 0 ? theme.COLORS.LIGHT_GREY : theme.COLORS.WHITE };
  padding: 1.6rem;

  &.student {
    cursor: pointer;
  }

  svg {
    cursor: pointer;
  }

  svg:hover {
    color: ${({ theme }) => theme.COLORS.PURPLE};
  }
`;

export const CoverContainer = styled.div`
  width: 16rem;
  height: 18rem;
  position: relative;
  cursor: pointer;

  > img {
    border-radius: 8px;
  }
`;

export const TextContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;

  > h1 {
    position: absolute;
    top: 0;
    right: 0;
    color: ${({ theme, $grade }) => ($grade >= 6 ? theme.COLORS.GREEN : theme.COLORS.DARK_RED)};
  }

  > svg {
    position: absolute;
    right: 0; 
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }

  p {
    text-transform: uppercase;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
    text-align: center;
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
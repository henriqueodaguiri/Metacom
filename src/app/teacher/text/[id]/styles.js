"use client";
import styled from "styled-components";

export const Container = styled.div`
  > div {
    margin-top: 2rem;
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
  gap: 1.6rem;
  position: relative;
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

export const CoverContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 250px;
  height: 250px;
  position: relative;
  border-radius: 20px;
  border: 4px solid ${({ theme }) => theme.COLORS.PURPLE};

  > img {
    border-radius: 16px;
  }
`;

export const CameraContainer = styled.label`
  cursor: pointer;
  border-radius: 50%;
  padding: 1.2rem;
  background-color: ${({ theme }) => theme.COLORS.PURPLE };
  position: absolute;
  bottom: -16px;
  right: -16px;

  input {
    display: none;
  }

  svg {
    cursor: pointer;
    color: ${({ theme }) => theme.COLORS.WHITE };
  }
`;

export const FieldsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 100%;

  > button {
    align-self: flex-end;
  }

  > textarea {
    height: 30vh;
  }
`;


export const ButtonsContainer = styled.div`
  margin: 2rem auto;
  display: flex;
  align-items: center; 
  justify-content: center;
  gap: 2rem;
  max-width: 800px;

  > button {
    margin: 2rem auto;
    box-shadow: 0 4px 8px rgba(0,0,0,0.5);

    &:last-child {
      flex: 1;
    }
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
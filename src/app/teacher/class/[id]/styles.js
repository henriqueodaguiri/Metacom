"use client";
import styled from "styled-components";

export const Container = styled.div`
  > div {
    margin-top: 2rem;
  } 
`;

export const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 2rem;

  > h2 {
    flex: 1;
    text-align: center;
  }

  > svg {
    color: ${({ theme }) => theme.COLORS.PURPLE };
    cursor: pointer;
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
  position: relative;

  h1 {
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

export const FieldsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;

  > button {
    align-self: flex-end;
  }

  > textarea {
    height: 30vh;
  }
`;

export const AccessKeyContainer = styled.div`
  > label {
    padding: 1.6rem;
  }
`;

export const ItensContainer = styled.div`
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  border: 2px solid ${({ theme }) => theme.COLORS.LIGHT_GREY };
`;

export const AccessKeyWrapper = styled.div`
  border: 2px solid ${({ theme }) => theme.COLORS.PURPLE};
  overflow: hidden;
  background-color: ${({ theme }) => theme.COLORS.LIGHT_GREY};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 20px;
  gap: 0.8rem;
  width: 100%;
  margin-top: 0.8rem;

  > svg {
    color: ${({ theme }) => theme.COLORS.LIGHT};
    background-color: ${({ theme }) => theme.COLORS.PURPLE};
    padding: 0 1.2rem;
    cursor: pointer;
  }

  > p {
    padding: 0 1.2rem;
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
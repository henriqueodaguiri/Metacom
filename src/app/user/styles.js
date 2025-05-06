"use client";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
`;

export const UserContainer = styled.div`
  margin: 0 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 4rem;
  background-color: ${({ theme }) => theme.COLORS.WHITE };
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  max-width: 40rem;

  > button {
    margin-top: 2rem;
  }
`;

export const AvatarContainer = styled.div`
  width: 16rem;
  height: 16rem;
  border-radius: 50%;
  position: relative;

  > img {
    border-radius: 50%;
  }
`;

export const CameraContainer = styled.label`
  cursor: pointer;
  border-radius: 50%;
  padding: 1.2rem;
  background-color: ${({ theme }) => theme.COLORS.PURPLE };
  position: absolute;
  bottom: 0;
  right: 0;

  input {
    display: none;
  }

  svg {
    cursor: pointer;
    color: ${({ theme }) => theme.COLORS.WHITE };
  }
`;
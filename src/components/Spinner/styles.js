"use client";

import styled, { keyframes } from "styled-components";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

export const SpinnerElement = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border-left-color: ${({ theme }) => theme.COLORS.PURPLE };
  animation: ${spin} 1s linear infinite;
`;
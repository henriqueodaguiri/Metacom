"use client";
import styled from "styled-components";

export const InputWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.6rem;
  width: 100%;

  > div {
    flex: 1;
  }

  > input {
    border: 1px solid ${({ theme }) => theme.COLORS.PURPLE }
  }
`;
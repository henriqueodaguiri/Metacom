"use client";
import styled from "styled-components";

export const Container = styled.label`
  display: flex;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

export const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

export const StyledCheckbox = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  transition: all 150ms;
  border: 2px solid ${({ theme, disabled }) => (disabled ? theme.COLORS.GRAY : theme.COLORS.PURPLE)};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  ${HiddenCheckbox}:focus + & {
    box-shadow: ${({ theme, disabled }) => !disabled && `0 0 0 3px ${theme.COLORS.VIOLET}`};
  }
`;

export const IconWrapper = styled.div`
  font-size: 1.6rem;

  > svg {
    color: ${({ theme, disabled }) => (disabled ? theme.COLORS.GRAY : theme.COLORS.PURPLE)};
  }
`;
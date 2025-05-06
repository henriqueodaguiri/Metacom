"use client";
import styled from "styled-components";

export const Container = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 2rem;

  svg {
    color: ${({ theme }) => theme.COLORS.PURPLE};
  }
`;

export const CoverContainer = styled.div`
  width: 10rem;
  height: 12rem;
  position: relative;
  cursor: pointer;

  > img {
    border-radius: 8px;
  }
`;

export const ContentContainer = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.COLORS.LIGHT};
  border: 2px solid ${({ theme }) => theme.COLORS.PURPLE};
  border-radius: 20px;
  cursor: pointer;
  z-index: 999;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;

  p {
    font-weight: 500;
    text-transform: uppercase;
    text-align: center;
    flex: 1;
  }
`;

export const TextContainer = styled.div`
  width: 100%;
  background-color: ${({ theme, $index }) => $index % 2 === 0 ? theme.COLORS.LIGHT_GREY : theme.COLORS.LIGHT};
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) => theme.COLORS.GREY};
  }
`;

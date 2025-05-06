"use client";
import styled from "styled-components";

export const Container = styled.div`
  margin-top: 2rem;
  border-radius: 20px;
  overflow: hidden; 
  border: 2px solid ${({ theme }) => theme.COLORS.PURPLE}; 
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse; 
  background-color: ${({ theme }) => theme.COLORS.LIGHT};
`;

export const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.COLORS.GREY};
  background-color: ${({ theme }) => theme.COLORS.WHITE};
`;

export const TableCell = styled.td`
  padding: 0.8rem;
  
  &:first-child {
    width: 100%; 
  }
  
  &:last-child {
    white-space: nowrap; 
  }

  svg {
    cursor: pointer;
    margin-right: 1rem;
  }

  svg:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.COLORS.PURPLE};
  }
`;

export const TableHeader = styled.th`
  text-align: left;
  padding: 0.8rem;
  background-color: ${({ theme }) => theme.COLORS.LIGHT};
  border-bottom: none;
  width: 100%;
  &:last-child {
    text-align: center;
  }
`;

export const ToggleButton = styled.button`
  background: none;

  &:hover {
    color: ${({ theme }) => theme.COLORS.VIOLET};
  }
`;

export const ChoicesRow = styled.tr`
  background-color: ${({ theme }) => theme.COLORS.LIGHT};

  li {
    padding: 0.6rem;
    border-bottom: 1px solid ${({ theme }) => theme.COLORS.DARK_GREY};
    font-weight: 500;
  }
`;

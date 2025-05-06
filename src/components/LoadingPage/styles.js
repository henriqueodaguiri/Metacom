"use client";
import styled from "styled-components";

export const Container = styled.div`
  position: fixed;
  top: -20px;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  transition: opacity 0.3s ease;
  opacity: 1;
  pointer-events: "all";
`;
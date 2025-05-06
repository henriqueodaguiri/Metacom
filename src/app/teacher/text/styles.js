"use client";
import styled from "styled-components";

export const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: none;
`;

export const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.4rem;
  margin-bottom: 2.4rem;
  width: 100%;
  max-width: 1200px; 
  margin: 2.4rem auto;
`;

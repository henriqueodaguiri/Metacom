import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    font-size: 62.5%;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body { 
    background-color: ${({ theme }) => theme.COLORS.VIOLET};
    color: ${({ theme }) => theme.COLORS.BLACK};
    -webkit-font-smoothing: antialiased;
  }
  
  body, input, button, textarea, select {
     font-family: "Fredoka", sans-serif;
     color: ${({ theme }) => theme.COLORS.BLACK };
     font-size: 2rem;
     outline: none;
  }

  button {
    color: ${({ theme }) => theme.COLORS.WHITE };
  }

  option {
    background-color: ${({ theme }) => theme.COLORS.WHITE};
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.COLORS.BLACK }
  }

  h1 {
    font-weight: 600;
    color: ${({ theme }) => theme.COLORS.BLACK }
  }

  svg {
    color: ${({ theme }) => theme.COLORS.BLACK }
  }

  button, a {
    cursor: pointer;
    border: none;
    transition: filter 0.2s;
  }

  button:hover, a:hover {
    filter: brightness(0.9);
  }

  ul, li {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  ::-webkit-scrollbar {
      width: 1.2rem;
  }

  ::-webkit-scrollbar-track {
      background: ${({ theme }) => theme.COLORS.VIOLET }; 
      border-radius: 20px; 
  }

  ::-webkit-scrollbar-thumb {
      background: ${({ theme }) => theme.COLORS.GREY }; 
      border-radius: 20px; 
  }

  ::-webkit-scrollbar-thumb:hover {
      background: ${({ theme }) => theme.COLORS.DARK_GREY }; 
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
  
  .correct {
    color: ${({ theme }) => theme.COLORS.GREEN }; 
  }

  .incorrect {
    color: ${({ theme }) => theme.COLORS.RED }; 
  }
`;

export default GlobalStyle;

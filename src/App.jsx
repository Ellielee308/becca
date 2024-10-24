import { Outlet } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { Reset } from "styled-reset";
import Header from "./components/Header";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  @font-face {
    font-family: 'TaiwanPearl-Regular';
    src: url('/assets/TaiwanPearl-Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  body {
    font-family: 'TaiwanPearl-Regular', "Noto Sans TC", sans-serif; 
  }

  a {
    text-decoration: none; 
    color: inherit; 
  }
`;

function App() {
  return (
    <>
      <Reset />
      <GlobalStyle />
      <Header />
      <Outlet />
    </>
  );
}

export default App;

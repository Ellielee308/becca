import { Outlet } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { Reset } from "styled-reset";
import Header from "./components/Header";
import Footer from "./components/Footer";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  @font-face {
    font-family: 'TaiwanPearl-Regular';
    src: url('/src/assets/TaiwanPearl-Regular.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
  body {
    font-family:  "Noto Sans TC", sans-serif; 
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
      <Footer />
    </>
  );
}

export default App;

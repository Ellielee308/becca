import { Outlet } from "react-router-dom";
import { createGlobalStyle } from "styled-components";
import { Reset } from "styled-reset";
import Header from "./components/Header";
import Footer from "./components/Footer";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  body {
    font-family: "jf-openhuninn", "Noto Sans TC", sans-serif;
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

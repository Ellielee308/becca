import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import styled from "styled-components";

const Layout = () => {
  return (
    <Container>
      <Sidebar />
      <Content>
        <Outlet />
      </Content>
    </Container>
  );
};

export default Layout;

const Container = styled.div`
  display: flex;
  min-height: calc(100vh - 60px);
`;

const Content = styled.div`
  margin-left: 10vw;
  padding: 20px;
  width: 90vw;
  @media only screen and (max-width: 639px) {
    margin-left: 0;
    width: 100vw;
  }
`;

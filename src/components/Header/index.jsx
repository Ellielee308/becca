import styled from "styled-components";

function Header() {
  return (
    <Wrapper>
      <div>BECCA</div>
    </Wrapper>
  );
}

export default Header;

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 60px;
  width: 100%;
  padding: 20px 15px;
  background-color: #eff7ff;
  z-index: 99;
`;

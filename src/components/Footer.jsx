import styled from "styled-components";
function Footer() {
  return <Wrapper>2024</Wrapper>;
}

export default Footer;

const Wrapper = styled.div`
  height: 60px;
  width: 100%;
  padding: 20px 15px;
  background-color: #eff7ff;
  text-align: left;
  position: relative; /* 確保有 position */
  z-index: 99; /* 調整 z-index */
`;

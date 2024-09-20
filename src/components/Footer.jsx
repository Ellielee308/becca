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
  text-align: center;
  position: relative; /* 確保有 position */
  z-index: 999; /* 調整 z-index */
`;

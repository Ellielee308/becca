import styled from "styled-components";
function Footer() {
  return (
    <Wrapper>
      <FooterText>© BECCA 2024</FooterText>
    </Wrapper>
  );
}

export default Footer;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 100%;
  padding: 20px 15px;
  background-color: rgb(250, 247, 245);
  z-index: 99;
`;

const FooterText = styled.p`
  font-family: "Raleway", sans-serif;
  font-size: 14px;
  user-select: none;
`;

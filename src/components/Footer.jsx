import styled from "styled-components";
function Footer() {
  return (
    <Wrapper>
      <FooterLinkWrapper>
        <FooterLink>關於我們</FooterLink>
        <FooterLink>隱私政策</FooterLink>
        <FooterLink>聯絡我們</FooterLink>
      </FooterLinkWrapper>
      <FooterText>© BECCA 2024</FooterText>
    </Wrapper>
  );
}

export default Footer;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 18px 15px 10px;
  background-color: #3d5a80; /* 使用主題色作為背景色 */
  color: #ffffff; /* 白色文字與深色背景形成對比 */
  z-index: 6;
`;

const FooterText = styled.p`
  font-size: 14px;
  user-select: none;
  margin-top: 10px;
  color: #e1e5f2;
`;

const FooterLinkWrapper = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
`;

const FooterLink = styled.div`
  font-size: 16px;
  color: #e1e5f2; /* 主題風格的淺藍色 */
  user-select: none;
`;

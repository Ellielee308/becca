import styled from "styled-components";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <Wrapper>
      <StyledNavLink to="/user/me/profile">總覽</StyledNavLink>
      <StyledNavLink to="/user/me/cardsets">卡牌組</StyledNavLink>
      {/* <StyledNavLink to="/user/me/analytics">學習狀態</StyledNavLink> */}
    </Wrapper>
  );
}

export default Sidebar;

const Wrapper = styled.div`
  position: fixed;
  top: 60px;
  left: 0;
  padding: 80px 0 20px 0;
  display: flex;
  flex-direction: column;
  background-color: #f0f4fa;
  min-height: calc(100vh - 60px);
  width: 10vw;
  align-items: center;
  gap: 16px;

  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);

  border: 1px solid #e0e4e8;

  transition: all 0.3s ease-in-out;

  &:hover {
    width: 11vw;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
    background-color: #e2ebf5;
  }
`;
const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  width: 80%;
  color: black;
  text-decoration: none;
  border-radius: 24px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &.active {
    background-color: #a4c8e1;
    border-radius: 24px;
  }

  &:hover {
    background-color: #8ab8d6;
  }
`;

import styled from "styled-components";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <Wrapper>
      <StyledNavLink to="/user/me/profile">總覽</StyledNavLink>
      <StyledNavLink to="/user/me/cardsets">卡牌組</StyledNavLink>
      <StyledNavLink to="/user/me/analytics">學習狀態</StyledNavLink>
    </Wrapper>
  );
}

export default Sidebar;

const Wrapper = styled.div`
  position: fixed; /* 固定位置 */
  top: 60px;
  left: 0;
  padding: 80px 0 20px 0;
  display: flex;
  flex-direction: column;
  background-color: #c5d5ea;
  min-height: calc(100vh - 60px);
  width: 10vw;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 30px;
  height: 40px;
  width: 100%;
  color: black; /* 文字顏色 */
  text-decoration: none; /* 去除下劃線 */

  &.active {
    background-color: #a4c8e1; /* 當前路由的背景顏色 */
    border-radius: 4px; /* 可選：圓角 */
  }

  &:hover {
    background-color: #8ab8d6; /* 滑鼠懸停時的背景顏色 */
  }
`;

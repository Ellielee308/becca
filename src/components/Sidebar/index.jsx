import { signOut } from "firebase/auth";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FolderIcon, HomeIcon, LogOutIcon } from "../../assets/icons/index.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { auth } from "../../utils/firebaseConfig.js";

function Sidebar() {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("登出失敗:", error.message);
    }
  };

  return (
    <Wrapper>
      <NavLinkWrapper>
        <StyledNavLink to="/user/me/profile">
          <HomeIcon />
          <NavItemName>總覽</NavItemName>
        </StyledNavLink>
        <StyledNavLink to="/user/me/cardsets">
          <FolderIcon />
          <NavItemName>卡牌組</NavItemName>
        </StyledNavLink>
      </NavLinkWrapper>
      <LogOutButton
        onClick={() => {
          handleLogOut();
        }}
      >
        <LogOutIcon />
        <NavItemName>登出</NavItemName>
      </LogOutButton>
    </Wrapper>
  );
}

export default Sidebar;

const Wrapper = styled.div`
  position: fixed;
  top: 60px;
  left: 0;
  display: flex;
  flex-direction: column;
  padding: 18px 0 20px 0;
  background-color: #eff0f1;
  min-height: calc(100vh - 60px);
  width: 180px;
  align-items: center;
  border-right: 1px solid #e6e3e1;
  z-index: 5;
  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const NavLinkWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  gap: 4px;
`;
const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 12px 0 12px;
  height: 40px;
  width: 80%;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s ease, color 0.3s ease;
  color: #636363;

  &.active {
    background-color: #c5e0ee;
    border-radius: 6px;
    color: rgb(52, 58, 109);
  }

  &:hover {
    background-color: #cbdde689;
  }

  &.active:hover {
    background-color: #c5e0ee;
  }
`;

const NavItemName = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  margin-left: 12px;
`;

const LogOutButton = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 12px 0 12px;
  height: 40px;
  width: 80%;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.3s ease, color 0.3s ease;
  color: #636363;
  cursor: pointer;

  &.active {
    background-color: #c5e0ee;
    border-radius: 6px;
    color: rgb(52, 58, 109);
  }

  &:hover {
    background-color: #cbdde689;
  }

  &.active:hover {
    background-color: #c5e0ee;
  }
`;

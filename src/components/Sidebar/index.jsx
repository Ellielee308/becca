import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { auth } from "../../utils/firebaseConfig.js";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

function Sidebar() {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      console.log("用戶登出");
      setUser(null); // 清除用戶狀態，更新 UI
      navigate("/"); // 重定向到首頁
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
          <FolderOpenIcon />
          <NavItemName>卡牌組</NavItemName>
        </StyledNavLink>
        <StyledNavLink to="/user/me/collection">
          <StarIcon />
          <NavItemName>收藏</NavItemName>
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
  padding: 18px 0 60px 0;
  background-color: #fff;
  min-height: calc(100vh - 60px);
  width: 180px;
  align-items: center;

  z-index: 5;

  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06); */

  /* border: 1px solid #e0e4e8; */

  transition: all 0.3s ease-in-out;

  /* &:hover {
    width: 200px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
    background-color: #e2ebf5;
  } */
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

const FolderOpenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="20"
    height="20"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
    />
  </svg>
);

const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    width="20"
    height="20"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="20"
    height="20"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);

const LogOutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="20"
    height="20"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
    />
  </svg>
);

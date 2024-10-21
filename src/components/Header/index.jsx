import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  FolderIcon,
  HeaderCloseIcon,
  HeaderMobileMenuIcon,
  HeaderPlusIcon,
  HeaderSearchIcon,
  HeaderSearchIconMobile,
  HeaderSubMenuFolderIcon,
  HeaderSubMenuHomeIcon,
  HeaderSubMenuLogOutIcon,
  HeaderSubMenuPlusIcon,
  HomeIcon,
  LogOutIcon,
} from "../../assets/icons/index.jsx";
import { useUser } from "../../context/UserContext.jsx";
import { auth } from "../../utils/firebaseConfig.js";
import LoginModal from "../LoginModal";
import beccaLogo from "./images/becca-logo.png";

function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, setUser, loading } = useUser();
  const [searchInputValue, setSearchInputValue] = useState("");
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newOpacity = Math.max(1 - scrollY / 300, 0.8);
      setOpacity(newOpacity);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("登出失敗:", error.message);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/search/${searchInputValue}`);
    setSearchInputValue("");
    setShowMobileSearchBar(false);
  };

  const handleClickMobileSearchTrigger = () => {
    setShowMobileSearchBar(true);
  };

  const handleCloseMobileSearch = () => {
    setShowMobileSearchBar(false);
  };

  const toggleSidebar = () => {
    setShowSidebar((prevState) => !prevState);
  };

  return (
    <Wrapper style={{ background: `rgba(255, 255, 255, ${opacity})` }}>
      <MenuLogoWrapper>
        {!loading && user && (
          <MobileMenuContainer onClick={toggleSidebar}>
            <HeaderMobileMenuIcon />
          </MobileMenuContainer>
        )}
        <Link to="/">
          <LogoImg src={beccaLogo} alt="Logo" />
        </Link>
      </MenuLogoWrapper>
      {showMobileSearchBar && (
        <MobileSearchSection>
          <HeaderSearchIcon />
          <form onSubmit={handleSearch}>
            <SearchInput
              placeholder="搜尋 Flashcards"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
          </form>
          <CloseIconContainer onClick={handleCloseMobileSearch}>
            <HeaderCloseIcon />
          </CloseIconContainer>
        </MobileSearchSection>
      )}
      <SearchSection>
        <HeaderSearchIcon />
        <form onSubmit={handleSearch}>
          <SearchInput
            placeholder="搜尋 Flashcards"
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
          />
        </form>
      </SearchSection>
      <NavigateWrapper>
        <MobileSearchTrigger onClick={handleClickMobileSearchTrigger}>
          <HeaderSearchIconMobile />
        </MobileSearchTrigger>
        {!loading && user ? (
          <>
            <LinkToCardSetNew to="/cardset/new">
              <IconContainer>
                <HeaderPlusIcon />
              </IconContainer>
            </LinkToCardSetNew>
            <NavItemWrapper>
              <ProfilePictureWrapper>
                {user.profilePicture && (
                  <ProfilePicture src={user.profilePicture} />
                )}
                <SubMenu>
                  <Profile>
                    <SubMenuProfilePicture src={user.profilePicture} />
                    <SubMenuProfileTextWrapper>
                      <SubMenuUsername>{user.username}</SubMenuUsername>
                      <SubMenuEmail>{user.email}</SubMenuEmail>
                    </SubMenuProfileTextWrapper>
                  </Profile>
                  <NavWrapper>
                    <StyledLink to="/user/me/profile">
                      <SubMenuItem>
                        <HeaderSubMenuHomeIcon />
                        <p>用戶總覽</p>
                      </SubMenuItem>
                    </StyledLink>
                    <StyledLink to="/user/me/cardsets">
                      <SubMenuItem>
                        <HeaderSubMenuFolderIcon />
                        <p>卡牌組</p>
                      </SubMenuItem>
                    </StyledLink>
                    <MobileLinkToCardSetNew to="/cardset/new">
                      <SubMenuItem>
                        <HeaderSubMenuPlusIcon />
                        <p>新增卡牌組</p>
                      </SubMenuItem>
                    </MobileLinkToCardSetNew>
                  </NavWrapper>
                  <SubMenuItem onClick={handleLogOut}>
                    <HeaderSubMenuLogOutIcon />
                    <p>登出</p>
                  </SubMenuItem>
                </SubMenu>
              </ProfilePictureWrapper>
            </NavItemWrapper>
          </>
        ) : !loading && !user && !showMobileSearchBar ? (
          <LoginTrigger onClick={() => setShowLoginModal(true)}>
            Sign in
          </LoginTrigger>
        ) : null}
      </NavigateWrapper>
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          isLoginMode={true}
        />
      )}
      {showSidebar && <Overlay onClick={toggleSidebar} />}
      <Sidebar showSidebar={showSidebar}>
        <SidebarContent>
          <CloseSidebarButton onClick={toggleSidebar}>
            <HeaderCloseIcon />
          </CloseSidebarButton>
          <MenuLogoWrapper>
            <LogoImg src={beccaLogo} alt="Logo" />
          </MenuLogoWrapper>
          <NavLinkWrapper>
            <StyledNavLink to="/user/me/profile" onClick={toggleSidebar}>
              <HomeIcon />
              <NavItemName>總覽</NavItemName>
            </StyledNavLink>
            <StyledNavLink to="/user/me/cardsets" onClick={toggleSidebar}>
              <FolderIcon />
              <NavItemName>卡牌組</NavItemName>
            </StyledNavLink>
          </NavLinkWrapper>
          <LogOutButton
            onClick={() => {
              handleLogOut();
              toggleSidebar();
            }}
          >
            <LogOutIcon />
            <NavItemName>登出</NavItemName>
          </LogOutButton>
        </SidebarContent>
      </Sidebar>
    </Wrapper>
  );
}
export default Header;

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 10px 14px;
  height: 60px;
  width: 100%;
  background: rgba(255, 255, 255, 1);
  border-bottom: 1px solid #e6e3e1;
  transition: background 0.2s ease-in-out;
  z-index: 100;
  @media only screen and (min-width: 640px) {
    padding: 10px 10px 10px 20px;
  }
`;

const LogoImg = styled.img`
  height: 36px;
  width: auto;
`;

const NavigateWrapper = styled.div`
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const MenuLogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
`;

const MobileMenuContainer = styled.div`
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  @media only screen and (min-width: 640px) {
    display: none;
  }
`;

const IconContainer = styled.div`
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3d5a80;
  border-radius: 4px;
`;

const LoginTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-size: 14px;
  padding: 8px 20px;
  background-color: #3d5a80;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 1s ease;
  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  }
  @media only screen and (max-width: 639px) {
    padding: 8px 12px;
  }
`;

const ProfilePictureWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover > div {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const SubMenu = styled.div`
  position: absolute;
  top: 132%;
  right: 0;
  background-color: white;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 10px;
  min-width: 220px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
  z-index: 100;
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 10px 10px 10px;
  height: 100px;
  border-bottom: 1px solid #e1e5f2;
  cursor: default;
`;

const SubMenuProfilePicture = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d3d3d3;
`;

const SubMenuProfileTextWrapper = styled.div`
  height: 100%;
  width: 50%;
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SubMenuUsername = styled.p`
  color: #22254c;
  margin-bottom: 10px;
`;
const SubMenuEmail = styled.p`
  font-size: 14px;
  color: #626481;
`;

const SubMenuItem = styled.div`
  color: #3e3e3f;
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  gap: 16px;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const NavWrapper = styled.div`
  padding: 4px 0;
  border-bottom: 1px solid #e1e5f2;
  margin-bottom: 4px;
`;

const StyledLink = styled(Link)`
  display: block;
  height: 100%;
  width: 100%;
`;

const NavItemWrapper = styled.div`
  display: flex;
  margin-right: 4px;
`;

const ProfilePicture = styled.img`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d3d3d3;
`;

const SearchSection = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: row;
  height: 40px;
  align-items: center;
  background-color: #eff0f1;
  border-radius: 12px;
  padding: 0 20px 0 20px;
  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  margin-left: 20px;
  border: none;
  height: 40px;
  font-size: 16px;
  line-height: 40px;
  background-color: transparent;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  &:focus {
    outline: none;
  }
`;

const MobileSearchTrigger = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;

  @media only screen and (min-width: 640px) {
    display: none;
  }
`;

const MobileSearchSection = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: row;
  height: 40px;
  width: 96%;
  z-index: 101;
  align-items: center;
  background-color: #eff0f1;
  border-radius: 12px;
  padding: 0 10px 0 20px;
  @media only screen and (min-width: 640px) {
    display: none;
  }
`;

const CloseIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: auto;
`;

const LinkToCardSetNew = styled(Link)`
  display: none;
  @media only screen and (min-width: 640px) {
    display: block;
  }
`;

const MobileLinkToCardSetNew = styled(Link)`
  display: block;
  @media only screen and (min-width: 640px) {
    display: none;
  }
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: ${(props) => (props.showSidebar ? "0" : "-100%")};
  width: 250px;
  height: 100%;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease-in-out;
  z-index: 200;
  @media only screen and (min-width: 640px) {
    display: none;
  }
`;

const SidebarContent = styled.div`
  padding: 10px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CloseSidebarButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const NavLinkWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 12px 0 12px;
  height: 40px;
  width: 100%;
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

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 150;
  @media only screen and (min-width: 640px) {
    display: none;
  }
`;

const LogOutButton = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
  justify-content: flex-start;
  padding: 0 12px 0 12px;
  height: 40px;
  width: 100%;
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

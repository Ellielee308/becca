import styled from "styled-components";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";

function Header() {
  const { user } = useUser();

  return (
    <Wrapper>
      <LogoText>
        <Link to="/">BECCA</Link>
      </LogoText>
      <NavigateWrapper>
        <Link to="/cardset/new">
          <IconContainer>
            <PlusIcon />
          </IconContainer>
        </Link>
        <ProfilePictureWrapper>
          {user && user.profilePicture && (
            <Link to="/user/me/cardsets">
              <ProfilePicture src={user.profilePicture} />
            </Link>
          )}
        </ProfilePictureWrapper>
      </NavigateWrapper>
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
  padding: 10px 10px 10px 30px;
  height: 60px;
  width: 100%;
  background-color: #eff7ff;
  z-index: 99;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const LogoText = styled.h1`
  font-family: monospace;
  font-size: 24px;
`;

const NavigateWrapper = styled.div`
  display: flex;
  height: 40px;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const ProfilePictureWrapper = styled.div`
  height: 60px;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfilePicture = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const IconContainer = styled.div`
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #adadad;
  border-radius: 4px;
`;

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#FFF"
    width="24"
    height="24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

import styled from "styled-components";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { useState } from "react";
import { register, login } from "../../utils/api.js";
import PropTypes from "prop-types";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebaseConfig.js";
import { useNavigate } from "react-router-dom";
import beccaLogo from "./images/becca-logo.png";

function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, setUser, loading } = useUser();
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
      <ImageWrapper>
        <Link to="/">
          <LogoImg src={beccaLogo} />
        </Link>
      </ImageWrapper>
      <NavigateWrapper>
        {!loading && user && (
          <>
            <WelcomeMessage>{`Welcome back, ${user.username}!`}</WelcomeMessage>
            <LogOutButton onClick={handleLogOut}>Log out</LogOutButton>
            <Link to="/cardset/new">
              <IconContainer>
                <PlusIcon />
              </IconContainer>
            </Link>
            <ProfilePictureWrapper>
              <Link to="/user/me/cardsets">
                {user && user.profilePicture && (
                  <ProfilePicture src={user.profilePicture} />
                )}
              </Link>
            </ProfilePictureWrapper>
          </>
        )}
        {!loading && !user && (
          <LoginTrigger
            onClick={() => {
              setShowLoginModal(true);
            }}
          >
            Login / Register
          </LoginTrigger>
        )}
      </NavigateWrapper>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
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

const ImageWrapper = styled.div`
  width: fit-content;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LogoImg = styled.img`
  height: 48px;
  width: auto;
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

const WelcomeMessage = styled.p`
  font-family: "Poppins", sans-serif;
  font-size: 16px;
  margin-right: 8px;
  user-select: none;
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

const LoginTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-size: 16px;
  padding: 8px 20px;
  background-color: beige;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  }
`;

const LogOutButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-size: 16px;
  padding: 8px 20px;
  background-color: transparent;
  color: #4e98dd; /* 藍色字體 */
  border: 2px solid #4e98dd; /* 藍色邊框 */
  border-radius: 8px; /* 圓角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 簡單陰影 */
  cursor: pointer;
  transition: all 0.2s ease; /* 簡單過渡效果 */

  &:hover {
    background-color: #e2f2ff; /* 懸停時，背景變為淡藍色 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 加強陰影效果 */
    transform: translateY(-1px); /* 輕微上升效果 */
  }

  &:active {
    transform: translateY(1px); /* 按下時稍微按下 */
    background-color: #e0efff; /* 按下時背景變深 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 陰影變小 */
  }
`;

const LoginModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true); // 控制登入或註冊模式
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // 用戶名（註冊時使用）
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await login(email, password);
        console.log("已透過 Modal 登入成功");
      } else {
        if (!username) {
          throw new Error("請輸入用戶名");
        }
        await register(email, password, username);
        console.log("已透過 Modal 註冊成功");
      }
      onClose();
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false); // 結束載入狀態
    }
  };

  const handleAuthError = (error) => {
    if (error.code === "auth/email-already-in-use") {
      setError("此 Email 已經被使用，請更換 Email");
    } else if (error.code === "auth/invalid-credential") {
      setError("Email或密碼錯誤，請重新輸入");
    } else {
      setError(error.message);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={onClose}>×</CloseButton>
        <ModalHeader>{isLogin ? "登入" : "註冊"}</ModalHeader>
        <Form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="密碼"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <Input
              type="text"
              placeholder="用戶名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          {error && <ErrorText>{error}</ErrorText>}
          <SubmitButton>
            {loading ? "處理中..." : isLogin ? "登入" : "註冊"}
          </SubmitButton>
        </Form>
        <ToggleText onClick={toggleMode}>
          {isLogin ? "沒有帳號？立即註冊" : "已經有帳號？立即登入"}
        </ToggleText>
      </ModalContent>
    </ModalOverlay>
  );
};
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const ModalHeader = styled.h2`
  margin-bottom: 20px;
  text-align: left;
  font-size: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  margin-bottom: 15px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
  &:focus {
    border-color: #4e98dd; /* 當焦點時變化顏色 */
  }
`;

const SubmitButton = styled.button`
  background: #4e98dd;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background: #367bb5;
  }
`;

const ToggleText = styled.p`
  margin-top: 20px;
  color: #4e98dd;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: red;
  margin-bottom: 8px;
`;

LoginModal.propTypes = {
  onClose: PropTypes.func,
};

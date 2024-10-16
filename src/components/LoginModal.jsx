import styled from "styled-components";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { register, login, signInWithGoogle } from "../utils/api";
import { Tooltip } from "antd";
import googleIcon from "./images/googleIcon.png";
import { useUser } from "../context/UserContext";

const LoginModal = ({ onClose, isLoginMode }) => {
  const [isLogin, setIsLogin] = useState(true); // 控制登入或註冊模式
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalidField, setInvalidField] = useState([]);
  const { user, setUser } = useUser();

  useEffect(() => {
    if (isLoginMode === false) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [isLoginMode]);

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[\u4e00-\u9fa5_a-zA-Z0-9]{1,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInvalidField([]);
    setLoading(true);
    setError("");
    let errors = [];

    // 檢查 email
    if (!validateEmail(email)) {
      errors.push("email");
    }

    // 檢查密碼
    if (!validatePassword(password)) {
      errors.push("password");
    }

    // 註冊時檢查用戶名
    if (!isLogin) {
      if (!username.trim()) {
        errors.push("username");
      } else if (!validateUsername(username)) {
        errors.push("username");
      }
    }

    // 若有錯誤，則不提交表單
    if (errors.length > 0) {
      setInvalidField(errors);
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
        console.log("已透過 Modal 登入成功");
        onClose();
      } else {
        await register(email, password, username);
        console.log("已透過 Modal 註冊成功");
        onClose();
      }
    } catch (err) {
      handleAuthError(err);
    } finally {
      setLoading(false);
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
          <InfoWrapper>
            <Title>Email</Title>
            <Tooltip title="請輸入有效的電子信箱地址">
              <InformationIconContainer>
                <InformationCircle />
              </InformationIconContainer>
            </Tooltip>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              $isInvalid={invalidField.includes("email")}
            />
          </InfoWrapper>
          <InfoWrapper>
            <Title>密碼</Title>
            <Tooltip title="密碼至少需有 6 個字元">
              <InformationIconContainer>
                <InformationCircle />
              </InformationIconContainer>
            </Tooltip>
            <Input
              type="password"
              placeholder="密碼"
              onChange={(e) => setPassword(e.target.value)}
              $isInvalid={invalidField.includes("password")}
            />
          </InfoWrapper>
          {!isLogin && (
            <InfoWrapper>
              <Title>用戶名</Title>
              <Tooltip title="用戶名最多 20 個字元，可包含中英文字元、數字和下劃線 ( _ )，不得包含特殊符號。">
                <InformationIconContainer>
                  <InformationCircle />
                </InformationIconContainer>
              </Tooltip>
              <Input
                type="text"
                placeholder="用戶名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                $isInvalid={invalidField.includes("username")}
              />
            </InfoWrapper>
          )}
          {error && <ErrorText>{error}</ErrorText>}
          <SubmitButton>
            {loading ? "處理中..." : isLogin ? "登入" : "註冊"}
          </SubmitButton>
        </Form>
        <ToggleText onClick={toggleMode}>
          {isLogin ? "沒有帳號？立即註冊" : "已經有帳號？立即登入"}
        </ToggleText>
        {/* 分隔線 */}
        <Divider>
          <DividerSplit />
          <DividerText>或</DividerText>
          <DividerSplit />
        </Divider>
        {/* Google 登入按鈕 */}
        <GoogleLoginButton onClick={() => signInWithGoogle(onClose, setUser)}>
          <GoogleIconImage src={googleIcon} />
          透過 Google 登入
        </GoogleLoginButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LoginModal;

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
  color: #3d5a80;
  user-select: none;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const InfoWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 9fr;
  margin-bottom: 15px;
  align-items: center;
  justify-content: flex-start;
`;

const Title = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #3d5a80;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: ${(props) =>
    props.$isInvalid ? "1.5px solid red" : "1px solid #ddd;"};
  border-radius: 5px;
  outline: none;
  &:focus {
    border-color: #4e98dd; /* 當焦點時變化顏色 */
  }
`;

const SubmitButton = styled.button`
  background: #3d5a80;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background: #4a88c6;
  }
`;

const ToggleText = styled.p`
  margin-top: 14px;
  color: #4e98dd;
  font-size: 12px;
  cursor: pointer;
  font-family: "Noto Sans TC", sans-serif;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: red;
  margin-bottom: 8px;
  font-family: "Noto Sans TC", sans-serif;
`;

const InformationIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Divider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 0 20px 0;
`;

const DividerSplit = styled.div`
  width: 100%;
  border-bottom: 1px solid #666;
`;

const DividerText = styled.div`
  margin: 0 18px 0 18px;
  font-size: 14px;
  color: #666;
`;

const GoogleLoginButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  padding: 6px;
  font-size: 14px;
  color: #666;
  background-color: #fff;
  border: none;
  border: 1px solid #666;
  font-family: "Noto Sans TC", sans-serif;
  border-radius: 5px;
  font-size: 14px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease,
    border-color 0.3s ease;
  &:hover {
    background-color: #f0f0f0; /* 淡灰色背景 */
    color: #333; /* 字體變深 */
    border-color: #333; /* 邊框變深 */
  }
`;

const GoogleIconImage = styled.img`
  width: 32px;
  height: 32px;
`;

const InformationCircle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#636363"
    width="20"
    height="20"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
    />
  </svg>
);

LoginModal.propTypes = {
  onClose: PropTypes.func,
  isLoginMode: PropTypes.bool,
};

import styled from "styled-components";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { register, login } from "../../utils/api.js";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { getCardSet, getStyle, getTemplate } from "../../utils/api";
import quizSVG from "./images/quiz.svg";
import gameSVG from "./images/game.svg";
import searchSVG from "./images/search.svg";
import customizeSVG from "./images/customize.svg";

function Home() {
  const [cardSetData, setCardSetData] = useState(null);
  const [template, setTemplate] = useState(null);
  const [style, setStyle] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  return (
    <Wrapper>
      <IntroductionSection>
        <BannerTextChinese>
          背卡有BECCA， <br />
          學習不再卡！
        </BannerTextChinese>
        <BannerText>
          Backed by Cards, <br /> Boosted by BECCA.
        </BannerText>
        <ButtonGroup>
          <SignUpButton onClick={() => setShowLoginModal(true)}>
            免費註冊
          </SignUpButton>
          <CallToActionButton>
            <Link to="/cardset/new">+ 創建自己的記憶卡牌組</Link>
          </CallToActionButton>
        </ButtonGroup>
      </IntroductionSection>
      <FeatureSection>
        <SectionTitle>
          四大特色功能
          <SectionEnglishSpan>Everything you need</SectionEnglishSpan>
        </SectionTitle>
        <FeatureGridWrapper>
          <FeatureGrid>
            <ImageContainer>
              <FeatureTitle>自定義字卡樣式</FeatureTitle>
              <FeatureImage src={customizeSVG} />
            </ImageContainer>
            <FeatureDescription>
              為你的學習創造專屬的字卡樣式。BECCA
              讓你可以自由選擇字卡的顏色、字體及佈局，打造屬於自己的個性化學習工具，讓記憶過程更有趣、更有效。
            </FeatureDescription>
          </FeatureGrid>
          <FeatureGrid>
            <ImageContainer>
              <FeatureTitle>智能建議內容</FeatureTitle>
              <FeatureImage src={searchSVG} />
            </ImageContainer>
            <FeatureDescription>
              新增字卡內容時，BECCA
              會根據你的輸入提供智能建議，幫助你快速找到最合適的翻譯詞彙，大幅節省字卡創建的時間。
            </FeatureDescription>
          </FeatureGrid>
          <FeatureGrid>
            <ImageContainer>
              <FeatureTitle>多樣化測驗模式</FeatureTitle>
              <FeatureImage src={quizSVG} />
            </ImageContainer>
            <FeatureDescription>
              檢視學習成果的最佳方式就是測驗！BECCA
              提供配對題和選擇題兩種測驗模式，讓你在互動中掌握知識，檢驗自己的學習成效，同時增加學習的趣味性。
            </FeatureDescription>
          </FeatureGrid>
          <FeatureGrid>
            <ImageContainer>
              <FeatureTitle>多人遊戲模式</FeatureTitle>
              <FeatureImage src={gameSVG} />
            </ImageContainer>
            <FeatureDescription>
              邀請朋友們一起學習吧！BECCA
              支持多人配對題與選擇題互動遊戲，讓學習不再是孤獨的過程，與好友同場挑戰、相互競爭，增加學習的動力和樂趣。
            </FeatureDescription>
          </FeatureGrid>
        </FeatureGridWrapper>
      </FeatureSection>
      <ExploreSection>
        <SectionTitle>
          探索熱門卡牌組
          <SectionEnglishSpan>Explore popular sets</SectionEnglishSpan>
        </SectionTitle>
        <ExploreTitle>英語</ExploreTitle>
        <CardSetWrapper></CardSetWrapper>
        <ExploreTitle>日語</ExploreTitle>
        <CardSetWrapper></CardSetWrapper>
        <ExploreTitle>韓文</ExploreTitle>
        <CardSetWrapper></CardSetWrapper>
      </ExploreSection>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </Wrapper>
  );
}

export default Home;

const Wrapper = styled.div`
  background-color: #eff7ff;
  width: 100%;
  height: fit-content;
  padding: 80px 0px 0px 0px;
  @media only screen and (max-width: 639px) {
    padding: 60px 0px 10px 0px;
  }
`;

const IntroductionSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 60px 30px 60px;
  background-color: #eff7ff;
  height: 340px;
`;

const BannerTextChinese = styled.div`
  font-size: 36px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  white-space: pre-line;
  line-height: 72px;
  color: #293241;
`;

const BannerText = styled.div`
  margin-top: 12px;
  font-size: 18px;
  font-family: "Lexend", sans-serif;
  white-space: pre-line;
  line-height: 32px;
  color: #293241;
`;

const SignUpButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin-top: 12px;
  width: fit-content;
  padding: 10px 14px;
  border-radius: 8px;
  margin-right: 8px;
  background-color: #3d5a80;
  color: #ffffff;
  cursor: pointer;
`;

const CallToActionButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin-top: 12px;
  width: fit-content;
  padding: 10px 14px;
  border-radius: 8px;
  background-color: #d3d2d2;
  color: #616161;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
`;

const SectionTitle = styled.div`
  font-size: 24px;
  font-family: "Noto Sans TC", sans-serif;
  white-space: pre-line;
  margin-bottom: 12px;
  font-weight: 500;
  color: #22254c;
`;

const SectionEnglishSpan = styled.span`
  font-size: 18px;
  font-family: "Poppins", sans-serif;
  margin-left: 8px;
`;

const FeatureSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px 60px 42px 60px;
  background-color: #fff;
`;

const FeatureGridWrapper = styled.div`
  display: grid;
  margin-top: 12px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px;
  @media (max-width: 1279px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 639px) {
    grid-template-columns: 1fr;
    margin: 12px auto 0 auto;
  }
`;

const FeatureGrid = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 360px;
  min-height: 400px;
  background-color: #f2f4f3;
  border-radius: 12px;
  border: 1px solid rgb(230, 227, 225);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  width: 100%;
  height: 55%;
  border-top-right-radius: 16px;
  border-top-left-radius: 16px;
  background-color: #fff;
`;

const FeatureImage = styled.img`
  width: 90%;
  height: 80%;
  object-fit: contain;
`;

const FeatureTitle = styled.p`
  font-size: 20px;
  margin: 16px 0;
  color: #3d5a80;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  padding: 16px 24px 16px 24px;
  color: #22254c;
  text-align: justify;
  line-height: 1.7; /* 增加行距 */
  letter-spacing: 0.04em; /* 增加字距 */
`;

const ExploreTitle = styled.div`
  font-size: 18px;
  font-family: "Noto Sans TC", sans-serif;
  font-weight: 400;
  color: #22254c;
`;
const ExploreEnglishSpan = styled.span`
  font-size: 16px;
  font-family: "Poppins", sans-serif;
  margin-left: 8px;
`;

const ExploreSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px 60px 30px 60px;
  background-color: #e1e5f2;
`;

const CardSetWrapper = styled.div`
  display: flex;
  height: 280px;
  width: 100%;
  outline: 1px solid black;
  margin: 20px 0;
  &:last-of-type {
    margin: 20px 0 0 0;
  }
`;

const LoginModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(false); // 控制登入或註冊模式
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
        onClose();
      } else {
        if (!username) {
          throw new Error("請輸入用戶名");
        }
        await register(email, password, username);
        console.log("已透過 Modal 註冊成功");
        onClose();
      }
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

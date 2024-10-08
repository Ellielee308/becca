import styled from "styled-components";
import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { register, login } from "../../utils/api.js";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import { getCardSet, getStyle } from "../../utils/api";
import quizSVG from "./images/quiz.svg";
import gameSVG from "./images/game.svg";
import searchSVG from "./images/search.svg";
import customizeSVG from "./images/customize.svg";
import learningSVG from "./images/learning.svg";
import { Skeleton } from "antd";

function Home() {
  const { user, loading } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [allCardSets, setAllCardSets] = useState({});
  const [allStyles, setAllStyles] = useState({});
  const [cardSetData, setCardSetData] = useState([]);
  const [styleData, setStyleData] = useState({});
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const exploreData = {
    english: [
      "jBnaIDOx7uYv9AsE2YVy",
      "9oOSuClpNFqbWrujEHle",
      "OZF0I6vBBYrak511I8J8",
      "RPPGIb5gbGMg4WzxBSEE",
      "jH4kPradOCKZM8SMH7to",
    ],
    japanese: [
      "RF4PwG15orgdw6uu9Dxt",
      "jT9sT4jV1j6j78SVjtPZ",
      "hwA45Ctnr8iapSlwhrjy",
      "HbVwvihKfneXonAI7Wkx",
      "GD41WWkFbWwhV8UEoq0w",
    ],
    korean: [
      "Xs29nvPJA8TqGL8RkZmL",
      "bt3Ovd9XJEy5orhb0nb2",
      "yC58RWlXDvG8oEQtzAp9",
      "lUdoYfQAvZH9sfR1vLf4",
      "v4yO156v7OFG43aVNroX",
      "Dro5LM2tQcAZlwyl9e9I",
      "PswtaA6E4eQXZy99e0KG",
    ],
  };

  const handleScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300; // 每次滾動的距離
      const container = carouselRef.current;

      if (direction === "left") {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
    }
  };

  useEffect(() => {
    const fetchAllCardSets = async () => {
      try {
        const cardSetPromises = [];
        const languageKeys = Object.keys(exploreData);

        // 加載所有語言的卡牌組
        languageKeys.forEach((language) => {
          const ids = exploreData[language];
          cardSetPromises.push(
            Promise.all(ids.map((cardSetId) => getCardSet(cardSetId)))
          );
        });

        const cardSetsByLanguage = await Promise.all(cardSetPromises);

        // 構建卡牌組和樣式的對應關係
        const allCardSets = {};
        const allStyles = {};

        for (let i = 0; i < languageKeys.length; i++) {
          const language = languageKeys[i];
          const cardSets = cardSetsByLanguage[i];
          allCardSets[language] = cardSets;

          // 加載對應樣式
          const styles = await Promise.all(
            cardSets.map((cardSet) => getStyle(cardSet.styleId))
          );

          const styleMap = {};
          cardSets.forEach((cardSet, index) => {
            styleMap[cardSet.styleId] = styles[index];
          });

          allStyles[language] = styleMap;
        }

        setAllCardSets(allCardSets);
        setAllStyles(allStyles);

        // 預設顯示英語的卡牌組和樣式
        setCardSetData(allCardSets["english"]);
        setStyleData(allStyles["english"]);
      } catch (error) {
        console.error("獲取卡牌組或樣式失敗：", error);
      }
    };

    fetchAllCardSets();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (allCardSets[selectedLanguage] && allStyles[selectedLanguage]) {
      setCardSetData(allCardSets[selectedLanguage]);
      setStyleData(allStyles[selectedLanguage]);
    }
  }, [selectedLanguage, allCardSets, allStyles]);

  if (!cardSetData || !styleData || loading) {
    return (
      <SkeletonWrapper>
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 2, width: [320, 320, 280, 280] }}
        />
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 2, width: [300, 300] }}
        />
        <SkeletonButtonWrapper>
          <Skeleton.Button style={{ width: 120 }} active />
          <Skeleton.Button style={{ width: 120 }} active />
        </SkeletonButtonWrapper>
      </SkeletonWrapper>
    );
  }
  return (
    <Wrapper>
      <IntroductionSection>
        <IntroductionSectionText>
          <BannerTextChinese>
            背卡有BECCA， <br />
            學習不再卡！
          </BannerTextChinese>
          <BannerText>
            Backed by Cards, <br /> Boosted by BECCA.
          </BannerText>
          <ButtonGroup>
            {user ? (
              <WelcomeText>{`歡迎回來，${user.username}！`}</WelcomeText>
            ) : (
              <SignUpButton onClick={() => setShowLoginModal(true)}>
                免費註冊
              </SignUpButton>
            )}
            <CallToActionButton
              onClick={() => {
                if (user) {
                  navigate("/cardset/new"); // 如果已登入，導航到創建卡牌組的頁面
                } else {
                  setShowLoginModal(true); // 如果未登入，顯示登入 Modal
                }
              }}
            >
              + 創建自己的記憶卡牌組
            </CallToActionButton>
          </ButtonGroup>
        </IntroductionSectionText>
        <BannerImg src={learningSVG} />
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
        <CarouselButtonGroup>
          <LanguageButton
            active={selectedLanguage === "english"}
            onClick={() => setSelectedLanguage("english")}
          >
            英語
          </LanguageButton>
          <LanguageButton
            active={selectedLanguage === "japanese"}
            onClick={() => setSelectedLanguage("japanese")}
          >
            日語
          </LanguageButton>
          <LanguageButton
            active={selectedLanguage === "korean"}
            onClick={() => setSelectedLanguage("korean")}
          >
            韓文
          </LanguageButton>
        </CarouselButtonGroup>
        <CarouselWrapper>
          <ScrollButton onClick={() => handleScroll("left")}>
            <LeftArrowIcon />
          </ScrollButton>
          <CardSetWrapper ref={carouselRef}>
            {cardSetData &&
              styleData &&
              cardSetData.map((cardSet) => {
                return (
                  <CardContainer
                    key={cardSet.cardSetId}
                    to={`/cardset/${cardSet.cardSetId}`}
                  >
                    <CardWrapper $cardSetStyle={styleData[cardSet.styleId]}>
                      {cardSet.title}
                    </CardWrapper>
                    <CardSetDetailsContainer>
                      <CardSetDescription>
                        {cardSet.description}
                      </CardSetDescription>
                    </CardSetDetailsContainer>
                  </CardContainer>
                );
              })}
          </CardSetWrapper>
          <ScrollButton onClick={() => handleScroll("right")}>
            <RightArrowIcon />
          </ScrollButton>
        </CarouselWrapper>
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
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 220px 30px 220px;
  background-color: #eff7ff;
  height: 400px;
  @media only screen and (min-width: 1440px) {
    height: 60vh;
  }
  @media only screen and (max-width: 1079px) {
    padding: 0 40px 0px 40px;
  }
`;

const IntroductionSectionText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BannerImg = styled.img`
  width: 360px;
  height: auto;
  @media only screen and (max-width: 1079px) {
    width: 240px;
  }
`;

const BannerTextChinese = styled.div`
  font-size: 36px;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  white-space: pre-line;
  line-height: 72px;
  color: #293241;
  font-weight: 500;
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
  width: fit-content;
  padding: 10px 14px;
  border-radius: 8px;
  background-color: #faf8f8;
  border: 1.5px solid #3d5a80;
  color: #3d5a80;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;
`;

const WelcomeText = styled.div`
  user-select: none;
  margin-right: 12px;
  color: #22254c;
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
  @media (max-width: 1079px) {
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

// const ExploreTitle = styled.div`
//   position: relative;
//   font-size: 18px;
//   font-family: "Noto Sans TC", sans-serif;
//   font-weight: 400;
//   color: #22254c;
//   margin-left: 20px;
//   margin-top: 16px;
//   &::before {
//     content: "";
//     position: absolute;
//     left: -20px; /* 控制垂直線距離文本的水平距離 */
//     top: 50%;
//     transform: translateY(-50%);
//     width: 4px; /* 控制垂直線的寬度 */
//     height: 28px; /* 控制垂直線的高度 */
//     background-color: #3d5a80;
//     border-radius: 2px;
//   }
// `;

const CarouselButtonGroup = styled.div`
  position: relative;
  display: flex;
  gap: 10px;
  margin: 16px 20px 0 20px;
  &::before {
    content: "";
    position: absolute;
    left: -20px; /* 控制垂直線距離文本的水平距離 */
    top: 50%;
    transform: translateY(-50%);
    width: 4px; /* 控制垂直線的寬度 */
    height: 28px; /* 控制垂直線的高度 */
    background-color: #3d5a80;
    border-radius: 2px;
  }
`;

const LanguageButton = styled.button`
  padding: 6px 16px;
  font-family: "Noto Sans TC", sans-serif;
  background-color: ${(props) => (props.active ? "#3d5a80" : "#fff")};
  color: ${(props) => (props.active ? "#fff" : "#3d5a80")};
  border-radius: 100vw;
  width: 70px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.5s ease;
  border: ${(props) => (props.active ? "none" : "1px solid #e6e3e1")};

  &:hover {
    background-color: ${(props) =>
      props.active ? "#3d5a80" : "#d0d7e3"}; // 使用 hover 顏色
  }
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

const CarouselWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const ScrollButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  color: #3d5a80;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 20px;
  cursor: pointer;
  z-index: 2;
  position: absolute; /* 設置按鈕為絕對定位 */
  top: 50%;
  transform: translateY(-50%);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c5d3e6;
  }

  &:focus {
    outline: none;
  }
  &:first-of-type {
    left: 10px; /* 左邊按鈕 */
  }
  &:last-of-type {
    right: 10px; /* 右邊按鈕 */
  }
`;

const CardSetWrapper = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  margin: 20px 60px;
  padding: 20px 16px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

const CardContainer = styled(Link)`
  flex: 0 0 280px;
  height: 300px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  background-color: #fff;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }
`;

const CardWrapper = styled.div`
  width: 100%;
  aspect-ratio: 3 / 2;
  max-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props) => props.$cardSetStyle.borderRadius};
  border: ${(props) => props.$cardSetStyle.borderStyle};
  border-width: ${(props) => props.$cardSetStyle.$borderWidth};
  border-color: ${(props) => props.$cardSetStyle.borderColor};
  background-color: ${(props) => props.$cardSetStyle.backgroundColor};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media only screen and (max-width: 1024px) {
    max-height: 320px;
  }
`;
const CardSetDetailsContainer = styled.div`
  padding-top: 14px;
  display: flex;
  flex-direction: column;
`;

const CardSetDescription = styled.p`
  margin-top: 8px;
  font-size: 14px;
  text-align: justify;
  height: 60px;
  overflow: hidden;
  white-space: pre-line;
  color: gray;
  word-break: break-word;
  line-height: 1.7;
  font-family: "Noto Sans TC", sans-serif;
`;

const LoginModal = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(false); // 控制登入或註冊模式
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // 用戶名（註冊時使用）
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

const LeftArrowIcon = () => (
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
      d="M15.75 19.5 8.25 12l7.5-7.5"
    />
  </svg>
);

const RightArrowIcon = () => (
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
      d="m8.25 4.5 7.5 7.5-7.5 7.5"
    />
  </svg>
);

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
  height: 100vh;
  padding: 180px 60px;
  background-color: #eff7ff;
`;

const SkeletonButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 30px;
  width: 100%; // 確保寬度被撐開
`;

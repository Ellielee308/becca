import styled, { css } from "styled-components";
import { useParams, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useEffect, useState, useCallback } from "react";
import {
  getCardSet,
  getStyle,
  getTemplate,
  getCardsOfCardSet,
  getUserDocument,
  isCardSetFavorited,
  unfavoriteCardSet,
  favoriteCardSet,
} from "../../utils/api";
import CreateQuizModal from "./CreateQuizModal";
import CreateGameModal from "./CreateGameModal";
import { useUser } from "../../context/UserContext.jsx";

function CardSetDetail() {
  const { cardSetId } = useParams();
  const [cardSetData, setCardSetData] = useState(null);
  const [template, setTemplate] = useState(null);
  const [style, setStyle] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [ownerData, setOwnerData] = useState();
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(null);
  const [showCreateGameModal, setShowCreateGameModal] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isCardListDisplayed, setIsCardListDisplayed] = useState(false);
  const { user } = useUser();
  useEffect(() => {
    const fetchCardSetData = async () => {
      try {
        const fetchedCardSetData = await getCardSet(cardSetId);
        if (!fetchedCardSetData) throw new Error("Card set not found");

        setCardSetData(fetchedCardSetData);

        const cardStyle = await getStyle(fetchedCardSetData.styleId);
        setStyle(cardStyle);

        const cardTemplate = await getTemplate(
          fetchedCardSetData.fieldTemplateId
        );
        setTemplate(cardTemplate);

        const unorderedCards = await getCardsOfCardSet(cardSetId);

        // 根據 cardSetData.cardOrder 陣列中的順序重排卡片
        const orderedCards = fetchedCardSetData.cardOrder
          .map((cardId) =>
            unorderedCards.find((card) => card.cardId === cardId)
          )
          .filter(Boolean); // 過濾掉可能未找到的卡片

        setCards(orderedCards);

        // 確認 userId 是否有效
        if (fetchedCardSetData.userId) {
          const ownerData = await getUserDocument(fetchedCardSetData.userId);
          setOwnerData(ownerData);
        } else {
          console.error("無效的 userId");
        }

        // 同時獲取該卡牌組的標籤資料
        // const fetchedCardSetLabelsData = await getLabelsOfCardSet(cardSetId);
        // if (!fetchedCardSetLabelsData) throw new Error("Labels not found");
        // console.log("獲取該卡牌組標籤成功：", fetchedCardSetLabelsData);
        // setLabels(fetchedCardSetLabelsData);
      } catch (error) {
        console.error("獲取卡牌組資料或標籤失敗：", error);
      }
    };

    fetchCardSetData();
  }, [cardSetId]);

  useEffect(() => {
    const checkIfFavorited = async () => {
      const favorited = await isCardSetFavorited(user.userId, cardSetId); // 假設你有這個函數
      setIsFavorited(favorited);
    };
    if (user) {
      checkIfFavorited();
    } else {
      setIsFavorited(false);
    }
  }, [user, cardSetId]);

  const handleNextCard = useCallback(() => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex < cards.length - 1 ? prevIndex + 1 : prevIndex
    );
  }, [cards.length]);
  const handlePreviousCard = useCallback(() => {
    setCurrentCardIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  }, []);

  const handleSwitchCardWithKeyboard = useCallback(
    (event) => {
      // 檢查當前是否聚焦在輸入框或文本框中
      const tagName = event.target.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea") {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          handlePreviousCard();
          break;
        case "ArrowRight":
          handleNextCard();
          break;
        default:
          return;
      }
    },
    [handleNextCard, handlePreviousCard]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleSwitchCardWithKeyboard);

    return () => {
      window.removeEventListener("keydown", handleSwitchCardWithKeyboard);
    };
  }, [handleSwitchCardWithKeyboard]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("會員才能使用收藏功能，請登入！");
      return;
    }
    try {
      if (isFavorited) {
        await unfavoriteCardSet(user.userId, cardSetId);
        setIsFavorited(false);
      } else {
        await favoriteCardSet(user.userId, cardSetId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("切換收藏狀態失敗：", error);
    }
  };

  const toggleCardListDisplay = () => {
    setIsCardListDisplayed((prev) => !prev);
  };

  if (!cardSetData || !cards || !ownerData) {
    return <div>Loading...</div>;
  }
  return (
    <Background>
      <Wrapper>
        {showCreateQuizModal && (
          <CreateQuizModal
            onClose={() => setShowCreateQuizModal(null)}
            quizType={showCreateQuizModal}
            cardSetId={cardSetId}
            totalCardsNumber={cards.length}
            cards={cards}
          />
        )}
        {showCreateGameModal && (
          <CreateGameModal
            onClose={() => setShowCreateGameModal(null)}
            quizType={showCreateGameModal}
            cardSetId={cardSetId}
            totalCardsNumber={cards.length}
            cards={cards}
          />
        )}
        <TitleBar>
          <Title>{cardSetData.title}</Title>
          <StarContainer onClick={handleToggleFavorite}>
            {isFavorited ? <FilledStarIcon /> : <StarIcon />}
          </StarContainer>
        </TitleBar>
        <CardContainer>
          <ArrowIconContainer
            disabled={currentCardIndex === 0}
            onClick={handlePreviousCard}
          >
            <LeftArrowIcon />
          </ArrowIconContainer>
          {cardSetId && style && template && cards && (
            <CardContent
              currentStyle={style}
              currentTemplate={template}
              currentCard={cards[currentCardIndex]}
            />
          )}
          <ArrowIconContainer
            disabled={currentCardIndex === cards.length - 1}
            onClick={handleNextCard}
          >
            <RightArrowIcon />
          </ArrowIconContainer>
        </CardContainer>
        <CardSetDetailsWrapper>
          <MobileActionBar>
            <MobileArrowIconContainer
              disabled={currentCardIndex === 0}
              onClick={handlePreviousCard}
            >
              <LeftArrowIcon />
            </MobileArrowIconContainer>
            <CardNumberWrapper>{`${currentCardIndex + 1} / ${
              cards.length
            }`}</CardNumberWrapper>
            <MobileArrowIconContainer
              disabled={currentCardIndex === cards.length - 1}
              onClick={handleNextCard}
            >
              <RightArrowIcon />
            </MobileArrowIconContainer>
          </MobileActionBar>
          <ProgressBar>
            <Progress
              width={`${((currentCardIndex + 1) / cards.length) * 100}%`}
            />
          </ProgressBar>
          <ActionWrapper>
            <LabelWrapper>
              <LabelIconContainer>
                <LabelIcon />
              </LabelIconContainer>
              <LabelNameContainer>
                {cardSetData.labels.length > 0 ? (
                  cardSetData.labels.map((label, index) => (
                    <LabelName key={index}>
                      {label.name}
                      {index < cardSetData.labels.length - 1 && ", "}
                    </LabelName>
                  ))
                ) : (
                  <LabelName>無標籤</LabelName>
                )}
              </LabelNameContainer>
            </LabelWrapper>
          </ActionWrapper>
          <InformationWrapper>
            <ProfilePictureWrapper>
              {cardSetData && ownerData && ownerData.profilePicture && (
                <ProfilePicture src={ownerData.profilePicture} />
              )}
            </ProfilePictureWrapper>
            <DescriptionWrapper>
              <AuthorName>{`作者： ${ownerData.username}`}</AuthorName>
              <Description>{cardSetData.description}</Description>
            </DescriptionWrapper>
          </InformationWrapper>
          <hr />
          <EvaluationSection>
            <SectionTitleWrapper>
              <PuzzleIcon />
              <SectionTitle>測驗</SectionTitle>
            </SectionTitleWrapper>
            <GameOptionsWrapper>
              <GameOptionButton
                onClick={() => {
                  if (!user) {
                    alert("會員才能創建測驗，請先登入！");
                    return;
                  }
                  if (cards.length < 4) {
                    alert("至少要有四張字卡才能進行配對測驗！");
                    return;
                  }
                  setShowCreateQuizModal("matching");
                }}
              >
                配對題
              </GameOptionButton>
              <GameOptionButton
                onClick={() => {
                  if (!user) {
                    alert("會員才能創建測驗，請先登入！");
                    return;
                  }
                  if (cards.length < 4) {
                    alert("至少要有四張字卡才能進行選擇題測驗！");
                    return;
                  }
                  setShowCreateQuizModal("multipleChoices");
                }}
              >
                選擇題
              </GameOptionButton>
            </GameOptionsWrapper>
            <SectionTitleWrapper>
              <MultiplePlayersIcon />
              <SectionTitle>多人遊戲</SectionTitle>
            </SectionTitleWrapper>
            <GameOptionsWrapper>
              <GameOptionButton
                $isGame
                onClick={() => {
                  if (!user) {
                    alert("會員才能創建遊戲，請先登入！");
                    return;
                  }
                  if (cards.length < 4) {
                    alert("至少要有四張字卡才能進行配對遊戲！");
                    return;
                  }
                  setShowCreateGameModal("matching");
                }}
              >
                配對題
              </GameOptionButton>
              <GameOptionButton
                $isGame
                onClick={() => {
                  if (!user) {
                    alert("會員才能創建遊戲，請先登入！");
                    return;
                  }
                  if (cards.length < 4) {
                    alert("至少要有四張字卡才能進行選擇題遊戲！");
                    return;
                  }
                  setShowCreateGameModal("multipleChoices");
                }}
              >
                選擇題
              </GameOptionButton>
            </GameOptionsWrapper>
            <hr />
          </EvaluationSection>
          <SectionTitleWrapper>
            <ListIcon />
            <SectionTitle>{`所有字卡  (${cards.length})`}</SectionTitle>
            <SpreadArrowContainer onClick={toggleCardListDisplay}>
              {isCardListDisplayed ? <ArrowUp /> : <ArrowDown />}
            </SpreadArrowContainer>
          </SectionTitleWrapper>
          {isCardListDisplayed && (
            <ListSection>
              {cards.map((card, index) => (
                <CardWrapper key={card.cardId}>
                  <SerialNumber>{index + 1}</SerialNumber>
                  <CardContentWrapper>
                    <Side>
                      <SideHeading>正面</SideHeading>
                      {template.frontFields.map((frontField, index) => {
                        if (frontField.type === "text") {
                          return (
                            <TextWrapper key={index}>
                              {card.frontFields[index].value}
                            </TextWrapper>
                          );
                        } else if (frontField.type === "image") {
                          if (
                            card.frontFields[index]?.value &&
                            card.frontFields[index].value.trim() !== ""
                          ) {
                            return (
                              <ImagePreview
                                key={index}
                                src={card.frontFields[index].value}
                                alt={frontField.name}
                              />
                            );
                          }
                        }
                      })}
                    </Side>
                    <SideSplit />
                    <Side>
                      <SideHeading>背面</SideHeading>
                      {template.backFields.map((backField, index) => {
                        if (backField.type === "text") {
                          return (
                            <TextWrapper key={index}>
                              {card.backFields[index].value}
                            </TextWrapper>
                          );
                        } else if (backField.type === "image") {
                          if (
                            card.backFields[index]?.value &&
                            card.backFields[index].value.trim() !== ""
                          ) {
                            return (
                              <ImagePreview
                                key={index}
                                src={card.backFields[index].value}
                                alt={backField.name}
                              />
                            );
                          }
                        }
                      })}
                    </Side>
                  </CardContentWrapper>
                </CardWrapper>
              ))}
            </ListSection>
          )}
        </CardSetDetailsWrapper>
      </Wrapper>
      <SideMenu>
        <SideMenuTitle>練習一下吧！</SideMenuTitle>
        <SideMenuSectionTitle>
          <PuzzleIcon />
          <p>測驗</p>
        </SideMenuSectionTitle>
        <SideMenuQuiz>配對測驗</SideMenuQuiz>
        <SideMenuQuiz>選擇題測驗</SideMenuQuiz>
        <SideMenuSectionTitle>
          <MultiplePlayersIcon />
          <p>多人遊戲</p>
        </SideMenuSectionTitle>
        <SideMenuGame>配對遊戲</SideMenuGame>
        <SideMenuGame>選擇題遊戲</SideMenuGame>
      </SideMenu>
    </Background>
  );
}

export default CardSetDetail;

const Background = styled.div`
  position: relative;
  background-color: #eff7ff;
  width: 100%;
  height: fit-content;
  padding: 60px 14px;
  @media only screen and (min-width: 640px) {
    display: flex;
    justify-content: center;
  }
`;

const Wrapper = styled.div`
  /* background-color: white; */
  margin: 0 auto;
  padding: 20px 20px;
  max-width: 1160px;
  /* box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); */
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  @media only screen and (min-width: 640px) {
    width: 1160px;
    padding: 0px 20px;
    margin: 0;
  }
`;

const TitleBar = styled.div`
  margin: 32px auto;
  width: 60%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  @media only screen and (max-width: 639px) {
    width: 100%;
    margin: 0px auto;
  }
`;

const Title = styled.div`
  font-size: 32px;
  user-select: none;
  font-family: "Noto Sans TC", sans-serif;
  color: "#3d5a80";
  @media only screen and (max-width: 639px) {
    font-size: 28px;
  }
`;

const StarContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgb(255, 205, 31);
  &:hover {
    cursor: pointer;
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`;

const ArrowIconContainer = styled.div`
  flex-basis: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) =>
    props.disabled ? "#aaa" : "#fff"}; // 使用亮色作為文字顏色
  background: ${(props) =>
    props.disabled ? "#d8d6d6" : "#3d5a80"}; // 深色背景來增加對比
  border-radius: 50%;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s;

  &:hover {
    background: ${(props) =>
      props.disabled ? "#d8d6d6" : "#293a50"}; // 增加深色在 hover 時的效果
  }

  @media only screen and (max-width: 639px) {
    display: none;
  }
`;

const MobileArrowIconContainer = styled.div`
  flex-basis: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.disabled ? "#d8d6d6" : "black")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  @media only screen and (min-width: 640px) {
    display: none;
  }
`;

const MobileActionBar = styled.div`
  display: flex;
  align-items: center;
`;

const CardSetDetailsWrapper = styled.div`
  width: 100%;
  margin: 20px auto; /* 上下邊距 */
  @media only screen and (min-width: 640px) {
    width: 60%;
  }
`;

const CardNumberWrapper = styled.div`
  width: fit-content;
  font-size: 18px;
  margin: 0 auto;
  color: gray;
  user-select: none;
`;

const ProgressBar = styled.div`
  height: 10px;
  background-color: #e0e0e0; /* 背景顏色 */
  border-radius: 5px;
  margin: 20px auto; /* 上下邊距 */
`;

const Progress = styled.div`
  height: 100%;
  width: ${(props) => props.width}; /* 根據進度設置寬度 */
  background-color: #76c7c0; /* 完成顏色 */
  border-radius: 5px;
  transition: width 0.3s ease; /* 動畫效果 */
`;

const ActionWrapper = styled.div`
  margin: 20px auto; /* 上下邊距 */
  justify-content: space-between;
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const LabelIconContainer = styled.div`
  width: 24px;
  height: 40px;
  display: flex;
  align-items: center;
`;

const LabelNameContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const LabelName = styled.span`
  white-space: pre;
  color: gray;
  font-size: 14px;
`;

const InformationWrapper = styled.div`
  margin: 20px auto; /* 上下邊距 */
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const DescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.p`
  font-size: 14px;
  margin-bottom: 8px;
`;

const Description = styled.div`
  font-size: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  white-space: pre-wrap;
`;

const ProfilePictureWrapper = styled.div`
  margin-right: 20px;
  height: 80px;
  width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfilePicture = styled.img`
  height: 64px;
  width: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #fff;
`;

const SectionTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 20px auto;
`;
const SectionTitle = styled.h3`
  margin-left: 16px;
`;

const GameOptionsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  margin: 20px auto;
  @media only screen and (max-width: 934px) {
    gap: 12px;
  }
`;

const GameOptionButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30%;
  height: 80px;
  background-color: ${(props) => (props.$isGame ? "#e2b657" : "#5a9bd4")};
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.$isGame ? "#caa34f" : "#4f88bb")};
  }

  &:active {
    transform: scale(0.98); /* 點擊時輕微縮小 */
  }
  @media only screen and (max-width: 934px) {
    flex: 1;
  }
`;

const EvaluationSection = styled.div`
  @media only screen and (min-width: 1024px) {
    display: none;
  }
`;

const ListSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
`;

const SpreadArrowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
  margin-left: 8px;
  cursor: pointer;
`;

const CardWrapper = styled.div`
  padding: 20px 30px;
  width: 100%;
  min-height: 180px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const SerialNumber = styled.p`
  font-size: 18px;
  margin-bottom: 8px;
`;

const CardContentWrapper = styled.div`
  display: flex;
  flex-direction: row;

  @media only screen and (max-width: 639px) {
    flex-direction: column;
  }
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const SideSplit = styled.div`
  height: 120px;
  border-left: 1px solid #c9c5c5;
  align-self: center;
  margin: 0px 30px;
  @media only screen and (max-width: 639px) {
    height: 0px;
    width: 20%;
    border-left: none;
    margin: 20px 0px;
  }
`;

const SideHeading = styled.p`
  font-size: 16px;
  margin-bottom: 12px;
  color: #696767;
`;

const TextWrapper = styled.div`
  font-size: 16px;
  line-height: 30px;
  border-bottom: 1px solid #c0c5c5;
`;

const ImagePreview = styled.img`
  height: 80px;
  width: auto;
  margin: 0 auto;
`;

const SideMenu = styled.div`
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  width: 20%;
  padding: 24px;
  height: fit-content;
  background-color: #f9f9f9;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  @media only screen and (max-width: 1023px) {
    display: none; // 隱藏側邊選單於小螢幕
  }
  @media only screen and (min-width: 1440px) {
    width: 278px;
  }
`;

const SideMenuTitle = styled.h3`
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 24px;
  color: #2c3e50;
`;

const SideMenuSectionTitle = styled.p`
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  margin-bottom: 16px;
  color: #34495e;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const SideMenuQuiz = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 56px;
  padding: 14px 18px;
  margin: 0 auto 16px auto;
  border-radius: 10px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  background-color: #3498db; // 使用明亮的藍色來提高視覺吸引力
  transition: all 0.3s;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #2980b9; // 當用戶懸停時，變為深藍色
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const SideMenuGame = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 56px;
  padding: 14px 18px;
  margin: 0 auto 16px auto;
  border-radius: 10px;
  color: #ffffff;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  background-color: #f39c12; // 使用暖橙色來突出多人遊戲部分
  transition: all 0.3s;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #e67e22; // 當用戶懸停時，變為較深的橙色
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

function CardContent({ currentStyle, currentTemplate, currentCard }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped((prevState) => !prevState);
  };
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCard]);

  return (
    <CardViewWrapper onClick={handleFlip}>
      <FlipCard isFlipped={isFlipped} currentStyle={currentStyle}>
        <FrontCard
          isFlipped={isFlipped}
          currentStyle={currentStyle}
          currentCard={currentCard}
        >
          {currentCard &&
            currentTemplate.frontFields.map((field, index) => {
              const currentFrontField = currentCard.frontFields[index];
              return (
                <FieldContainer
                  key={index}
                  $style={field.style}
                  $position={field.position}
                >
                  {renderFieldContent(
                    field,
                    currentFrontField ? currentFrontField.value : ""
                  )}
                </FieldContainer>
              );
            })}
        </FrontCard>
        <BackCard isFlipped={isFlipped} currentStyle={currentStyle}>
          {currentCard &&
            currentTemplate.backFields.map((field, index) => {
              const currentBackField = currentCard.backFields[index];
              return (
                <FieldContainer
                  key={index}
                  $style={field.style}
                  $position={field.position}
                >
                  {renderFieldContent(
                    field,
                    currentBackField ? currentBackField.value : ""
                  )}
                </FieldContainer>
              );
            })}
        </BackCard>
      </FlipCard>
    </CardViewWrapper>
  );
}

const renderFieldContent = (field, value) => {
  switch (field.type) {
    case "text":
      return value;

    case "image":
      if (value && value.trim() !== "") {
        return <Image src={value} alt={field.name} $style={field.style} />;
      }
      return null;

    default:
      return null;
  }
};

const getResponsiveFontSize = (fontSizeValue) => {
  let sizes;

  switch (fontSizeValue) {
    case "xs":
      sizes = { small: "8px", medium: "10px", large: "12px" };
      break;
    case "s":
      sizes = { small: "12px", medium: "14px", large: "18px" };
      break;
    case "m":
      sizes = { small: "16px", medium: "18px", large: "24px" };
      break;
    case "l":
      sizes = { small: "20px", medium: "22px", large: "30px" };
      break;
    case "xl":
      sizes = { small: "24px", medium: "26px", large: "36px" };
      break;
    case "2xl":
      sizes = { small: "29px", medium: "30px", large: "42px" };
      break;
    default:
      sizes = { small: "16px", medium: "20px", large: "24px" }; // 默認大小
  }

  return css`
    font-size: ${sizes.small};

    @media (min-width: 600px) {
      font-size: ${sizes.medium};
    }

    @media (min-width: 1024px) {
      font-size: ${sizes.large};
    }
  `;
};

const CardViewWrapper = styled.div`
  align-self: center;
  display: block;
  margin: 32px 0px;
  width: 100%;
  aspect-ratio: 3 / 2;
  max-width: 600px;
  perspective: 1000px;
  transform-style: preserve-3d;
  cursor: pointer;
  @media only screen and (max-width: 639px) {
    margin: 32px 0px;
  }
`;

const FlipCard = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: ${(props) => {
    switch (props.currentStyle.animation) {
      case "fade":
        return "opacity 0.5s ease-in-out";
      default:
        return "all 0.5s ease-in-out";
    }
  }};
  transform: ${(props) => {
    switch (props.currentStyle.animation) {
      case "horizontalFlip":
        return props.isFlipped ? "rotateY(180deg)" : "rotateY(0)";
      case "fade":
        return "none";
      default: // "vertical"
        return props.isFlipped ? "rotateX(180deg)" : "rotateX(0)";
    }
  }};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
  &:hover {
    transform: ${(props) => {
      switch (props.currentStyle.animation) {
        case "horizontalFlip":
          return props.isFlipped ? "rotateY(175deg)" : "rotateY(2deg)";
        case "fade":
          return "none";
        default: // "vertical"
          return props.isFlipped ? "rotateX(175deg)" : "rotateX(2deg)";
      }
    }};
    box-shadow: 0 20px 20px rgba(50, 60, 60, 0.2);
  }
`;

const FrontCard = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  outline-style: ${(props) => props.currentStyle.borderStyle};
  outline-color: ${(props) => props.currentStyle.borderColor};
  outline-width: ${(props) => props.currentStyle.borderWidth};
  background-color: ${(props) => props.currentStyle.backgroundColor};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  backface-visibility: hidden;
  font-family: ${(props) => props.currentStyle.fontFamily};
  font-size: 32px;
  opacity: ${(props) =>
    props.currentStyle.animation === "fade" && props.isFlipped ? 0 : 1};
  transition: ${(props) =>
    props.currentStyle.animation === "fade"
      ? "opacity 0.5s ease-in-out"
      : "none"};
`;

const BackCard = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  width: 100%;
  height: 100%;
  outline-style: ${(props) => props.currentStyle.borderStyle};
  outline-color: ${(props) => props.currentStyle.borderColor};
  outline-width: ${(props) => props.currentStyle.borderWidth};
  background-color: ${(props) => props.currentStyle.backgroundColor};
  border-radius: ${(props) => props.currentStyle.borderRadius};
  backface-visibility: hidden;
  font-family: ${(props) => props.currentStyle.fontFamily};
  transform: ${(props) => {
    switch (props.currentStyle.animation) {
      case "horizontalFlip":
        return "rotateY(180deg)";
      case "fade":
        return "none";
      default: // "vertical"
        return "rotateX(180deg)";
    }
  }};
  font-size: 32px;
  opacity: ${(props) =>
    props.currentStyle.animation === "fade" ? (props.isFlipped ? 1 : 0) : 1};
  transition: ${(props) =>
    props.currentStyle.animation === "fade"
      ? "opacity 0.5s ease-in-out"
      : "none"};
  z-index: ${(props) => (props.isFlipped ? 3000 : 0)};
`;

const FieldContainer = styled.div`
  position: absolute;
  display: flex;
  justify-content: ${(props) => props.$style.textAlign || "center"};
  align-items: center;
  ${(props) =>
    props.$style &&
    css`
      width: ${props.$style.width};
      height: ${props.$style.height};
      font-weight: ${props.$style.fontWeight};
      color: ${props.$style.color};
      font-style: ${props.$style.fontStyle};
      ${getResponsiveFontSize(props.$style.fontSize)};
    `}
  left: ${(props) => props.$position?.x};
  top: ${(props) => props.$position?.y};
  user-select: none;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${(props) => props.$style?.objectFit || "cover"};
  display: block;
`;

CardContent.propTypes = {
  currentTemplate: PropTypes.shape({
    templateName: PropTypes.string.isRequired,
    frontFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.oneOf(["text", "image"]).isRequired,
        required: PropTypes.bool.isRequired,
        position: PropTypes.shape({
          x: PropTypes.string.isRequired,
          y: PropTypes.string.isRequired,
        }).isRequired,
        style: PropTypes.shape({
          width: PropTypes.string.isRequired,
          height: PropTypes.string.isRequired,
          fontSize: PropTypes.string,
          fontWeight: PropTypes.string,
          color: PropTypes.string,
          textAlign: PropTypes.string,
        }).isRequired,
      })
    ).isRequired,
    backFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.oneOf(["text", "image"]).isRequired,
        required: PropTypes.bool.isRequired,
        position: PropTypes.shape({
          x: PropTypes.string.isRequired,
          y: PropTypes.string.isRequired,
        }).isRequired,
        style: PropTypes.shape({
          width: PropTypes.string.isRequired,
          height: PropTypes.string.isRequired,
          fontSize: PropTypes.string,
          fontWeight: PropTypes.string,
          color: PropTypes.string,
          textAlign: PropTypes.string,
        }).isRequired,
      })
    ).isRequired,
  }).isRequired,
  currentStyle: PropTypes.shape({
    styleId: PropTypes.string,
    userId: PropTypes.string.isRequired,
    styleName: PropTypes.string.isRequired,
    borderStyle: PropTypes.oneOf(["none", "solid", "dashed", "dotted"]),
    borderColor: PropTypes.string,
    borderWidth: PropTypes.string,
    borderRadius: PropTypes.string,
    backgroundColor: PropTypes.string.isRequired,
    fontFamily: PropTypes.string.isRequired,
    animation: PropTypes.oneOf(["verticalFlip", "horizontalFlip", "fade"])
      .isRequired,
  }).isRequired,
  currentCard: PropTypes.shape({
    cardId: PropTypes.string.isRequired,
    cardSetId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    frontFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })
    ).isRequired,
    backFields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })
    ).isRequired,
    createdAt: PropTypes.object.isRequired,
  }).isRequired,
};

const LeftArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="32"
    height="32"
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
    width="32"
    height="32"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m8.25 4.5 7.5 7.5-7.5 7.5"
    />
  </svg>
);

const LabelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path
      fillRule="evenodd"
      d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
      clipRule="evenodd"
    />
  </svg>
);

const PuzzleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="24"
    height="24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"
    />
  </svg>
);

const ListIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="24"
    height="24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
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
    width="32"
    height="32"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);

const FilledStarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="32"
    height="32"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);

const MultiplePlayersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="24"
    height="24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);

const ArrowDown = () => (
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
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const ArrowUp = () => (
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
      d="m4.5 15.75 7.5-7.5 7.5 7.5"
    />
  </svg>
);

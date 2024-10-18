import styled, { css } from "styled-components";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { updateQuiz } from "../../utils/api";

function Matching({ quizData, cardsData, template, style }) {
  const [randomCardPairs, setRandomCardPairs] = useState([]);
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [pairStatus, setPairStatus] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (quizData && cardsData.length > 0) {
      const pairNumbers = quizData.questionQty;
      const shuffledCards = [...cardsData].sort(() => 0.5 - Math.random());
      const selectedPairs = shuffledCards.slice(0, pairNumbers);
      //把一組卡牌拆分成兩組
      const cardPairs = selectedPairs.flatMap((card) => [
        { ...card, side: "front" },
        { ...card, side: "back" },
      ]);

      // 打亂正反面後的卡牌對
      const randomizedCardPairs = cardPairs.sort(() => 0.5 - Math.random());

      setRandomCardPairs(randomizedCardPairs);
    }
  }, [quizData, cardsData]);

  useEffect(() => {
    let interval;
    if (randomCardPairs.length > 0 && !isGameOver) {
      interval = setInterval(() => {
        setTimer((prevTime) => {
          return prevTime + 10;
        });
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [randomCardPairs, isGameOver]);

  useEffect(() => {
    if (
      matchedPairs.length === randomCardPairs.length &&
      randomCardPairs.length > 0
      //避免在初始化的時候就成立
    ) {
      setIsGameOver(true);
      const timeUsed = timer;
      const accuracy = ((matchedPairs.length / 2 / attempts) * 100).toFixed(2);
      const attemptsMade = attempts;

      const quizId = quizData.quizId;
      updateQuiz(quizId, {
        timeUsed,
        accuracy,
        attempts: attemptsMade,
      });
    }
  }, [matchedPairs, randomCardPairs.length, timer, attempts, quizData]);

  useEffect(() => {
    if (selectedPairs.length === 2) {
      const [firstCard, secondCard] = selectedPairs;
      setAttempts((prev) => prev + 1);

      // 延遲取消選取狀態
      setTimeout(() => {
        if (firstCard.cardId === secondCard.cardId) {
          setMatchedPairs((prevMatchedPairs) => [
            ...prevMatchedPairs,
            firstCard,
            secondCard,
          ]);
          setPairStatus("success");
        } else {
          setPairStatus("fail");
        }

        setTimeout(() => {
          setSelectedPairs([]);
          setPairStatus(null);
        }, 500);
      }, 500); // 500ms 延遲，確保選中動畫能顯示
    }
  }, [selectedPairs]);

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60000)).padStart(2, "0"); // 分鐘
    const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, "0"); // 秒
    const milliseconds = String(Math.floor((time % 1000) / 100));
    return `${minutes}:${seconds}.${milliseconds}`;
  };

  const handleSelect = (card) => {
    const newSelection = [...selectedPairs];

    // 檢查是否已經選中了這張卡片
    if (isCardSelected(card)) {
      // 如果點選重複的第一張卡片，取消選擇
      setSelectedPairs([]);
    } else {
      if (newSelection.length < 2) {
        newSelection.push(card);
        setSelectedPairs(newSelection);
      }
    }
  };

  const isCardSelected = (card) => {
    return selectedPairs.some(
      (selectedCard) =>
        selectedCard.cardId === card.cardId && selectedCard.side === card.side
    );
  };

  const isCardMatched = (card) => {
    return matchedPairs.some(
      (matchedCard) =>
        matchedCard.cardId === card.cardId && matchedCard.side === card.side
    );
  };

  const getOutlineColor = (isMatched, isSelected, pairStatus) => {
    if (isMatched) return "green";
    if (isSelected && pairStatus === "success") return "green";
    if (isSelected && pairStatus === "fail") return "red";
    if (isSelected) return "#4e98dd"; // 選中狀態，藍色
    return "none";
  };

  const accuracy =
    attempts > 0 ? ((matchedPairs.length / 2 / attempts) * 100).toFixed(2) : 0;

  return (
    <Wrapper>
      <Timer>{formatTime(timer)}</Timer>
      <CardGridWrapper>
        {randomCardPairs.length > 0 &&
          template &&
          randomCardPairs.map((randomCard) => (
            <CardWrapper
              key={`${randomCard.cardId}-${randomCard.side}`}
              $style={style}
              onClick={() =>
                handleSelect({
                  cardId: randomCard.cardId,
                  side: randomCard.side,
                })
              }
              $isSelected={isCardSelected({
                cardId: randomCard.cardId,
                side: randomCard.side,
              })}
              $isMatched={isCardMatched({
                cardId: randomCard.cardId,
                side: randomCard.side,
              })}
              $outlineColor={getOutlineColor(
                isCardMatched({
                  cardId: randomCard.cardId,
                  side: randomCard.side,
                }),
                isCardSelected({
                  cardId: randomCard.cardId,
                  side: randomCard.side,
                }),
                pairStatus
              )} // 動態設置 outline 顏色
            >
              <CardContent>
                {randomCard.side === "front"
                  ? template.frontFields.map((frontField, index) => (
                      <FieldContainer
                        key={index}
                        currentstyle={frontField.style}
                        currentposition={frontField.position}
                        // actualCardWidth={cardWidth} // 傳入實際卡片寬度
                      >
                        {renderFieldContent(
                          frontField,
                          randomCard.frontFields[index]
                            ? randomCard.frontFields[index].value
                            : ""
                        )}
                      </FieldContainer>
                    ))
                  : template.backFields.map((backField, index) => (
                      <FieldContainer
                        key={index}
                        currentstyle={backField.style}
                        currentposition={backField.position}
                        // actualCardWidth={cardWidth} // 傳入實際卡片寬度
                      >
                        {renderFieldContent(
                          backField,
                          randomCard.backFields[index]
                            ? randomCard.backFields[index].value
                            : ""
                        )}
                      </FieldContainer>
                    ))}
              </CardContent>
            </CardWrapper>
          ))}
      </CardGridWrapper>
      {matchedPairs.length > 0 && isGameOver && (
        <QuizResultModal
          timer={timer}
          accuracy={accuracy}
          cardSetId={quizData.cardSetId}
        />
      )}
    </Wrapper>
  );
}

export default Matching;

const renderFieldContent = (field, value) => {
  switch (field.type) {
    case "text":
      return value;

    case "image":
      if (value && value.trim() !== "") {
        return <Image src={value} alt={field.name} $imageStyle={field.style} />;
      }
      return null;

    default:
      return null;
  }
};

const FieldContainer = styled.div`
  position: absolute;
  display: flex;
  left: ${(props) => props.currentposition.x};
  top: ${(props) => props.currentposition.y};
  justify-content: ${(props) => props.currentstyle.textAlign || "center"};
  align-items: center;
  width: ${(props) =>
    props.currentstyle.width ? props.currentstyle.width : "auto"};
  height: ${(props) =>
    props.currentstyle.height ? props.currentstyle.height : "auto"};
  font-size: 14px;
  @media (min-width: 640px) {
    font-size: 16px;
  }
  @media (min-width: 1024px) {
    font-size: 18px;
  }
  font-weight: ${(props) => props.currentstyle.fontWeight || "normal"};
  color: ${(props) => props.currentstyle.color || "#333"};
  font-style: ${(props) => props.currentstyle.fontStyle || "normal"};
  user-select: none;
`;

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
      sizes = { small: "28px", medium: "30px", large: "42px" };
      break;
    default:
      sizes = { small: "16px", medium: "20px", large: "24px" }; // 默認大小
  }

  return css`
    font-size: ${sizes.small};

    @media (min-width: 640px) {
      font-size: ${sizes.medium};
    }

    @media (min-width: 1024px) {
      font-size: ${sizes.large};
    }
  `;
};

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${(props) => props.$imageStyle?.objectFit || "cover"};
  display: block;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: fit-content;
  width: 100%;
`;

const Timer = styled.div`
  align-self: center;
  font-size: 26px;
  color: gray;
  font-family: monospace;
`;

const CardGridWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
  width: 100%;
  @media only screen and (max-width: 639px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

const CardWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  background-color: ${(props) => props.$style.backgroundColor};
  opacity: ${(props) =>
    props.$isMatched ? "0" : props.$isSelected ? "1" : "0.7"};
  pointer-events: ${(props) =>
    props.$isMatched ? "none" : "auto"}; /* 配對後禁用互動 */
  border-style: ${(props) => props.$style.borderStyle};
  border-width: ${(props) => props.$style.borderWidth};
  border-color: ${(props) => props.$style.borderColor};
  font-family: ${(props) => props.$style.fontFamily};
  overflow-y: auto;
  cursor: pointer;
  outline: ${(props) => props.$outlineColor} 2px solid;

  transition: transform 0.3s ease, box-shadow 0.3s ease, outline 0.1s ease,
    opacity 0.5s ease;

  transform: ${(props) => (props.$isSelected ? "translateY(-5px)" : "none")};
  box-shadow: ${(props) =>
    props.$isSelected ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "none"};
`;

const CardContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

Matching.propTypes = {
  quizData: PropTypes.object,
  cardsData: PropTypes.array,
  template: PropTypes.object,
  style: PropTypes.object,
};

const QuizResultModal = ({ timer, accuracy, cardSetId }) => {
  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60000)).padStart(2, "0"); // 分鐘
    const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, "0"); // 秒
    const milliseconds = String(Math.floor((time % 1000) / 100));
    return `${minutes}:${seconds}.${milliseconds}`;
  };
  return (
    <ModalWrapper>
      <ModalContent>
        <Heading>測驗結果</Heading>
        <Title>花費時間：</Title>
        <Time>{formatTime(timer)}</Time>
        <Title>答對率：</Title>
        <Accuracy>{accuracy}%</Accuracy>
        <ButtonWrapper>
          <ReviewButton>
            <CustomLink to={`/cardset/${cardSetId}`}>複習卡牌 </CustomLink>
          </ReviewButton>
          <LeaveButton>
            <CustomLink to="/user/me/cardsets">離開</CustomLink>
          </LeaveButton>
        </ButtonWrapper>
      </ModalContent>
    </ModalWrapper>
  );
};

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 40px 40px 28px 40px;
  border-radius: 8px;
  width: 400px;
  height: fit-content;
  position: relative;
  overflow-y: auto;
`;

const Heading = styled.h3`
  font-size: 20px;
  margin-bottom: 18px;
`;

const Title = styled.p`
  font-size: 16px;
  margin-bottom: 28px;
`;

const Time = styled.p`
  text-align: center;
  font-size: 24px;
  color: gray;
  font-family: monospace;
  margin-bottom: 18px;
`;

const Accuracy = styled.p`
  text-align: center;
  font-size: 24px;
  color: gray;
  font-family: monospace;
  margin-bottom: 24px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ReviewButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45%;
  height: 50px;
  border-radius: 8px;
  background-color: #adbce5;
  cursor: pointer;
  user-select: none;
  color: white; // 文字顏色設為白色
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease; // 平滑的過渡效果

  &:hover {
    background-color: #889ccd; // 當懸停時，改變背景顏色
    color: #ffffff; // 保持白色字體
  }
`;

const LeaveButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 45%;
  height: 50px;
  border-radius: 8px;
  background-color: #f59873;
  cursor: pointer;
  user-select: none;
  color: #ffffff; // 文字顏色設為白色
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease, color 0.3s ease; // 平滑的過渡效果

  &:hover {
    background-color: #f57d51; // 當懸停時，改變背景顏色
    color: #ffffff; // 保持白色字體
  }
`;

const CustomLink = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  transition: color 0.3s ease;
`;

QuizResultModal.propTypes = {
  timer: PropTypes.number.isRequired,
  accuracy: PropTypes.number.isRequired,
  cardSetId: PropTypes.string.isRequired,
};

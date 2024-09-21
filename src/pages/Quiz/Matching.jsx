import styled from "styled-components";
import { useRef, useEffect, useState } from "react";

function Matching({ quizData, cardsData, template, style }) {
  const [randomCardPairs, setRandomCardPairs] = useState([]);
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  // const cardRef = useRef(null);
  // const [cardWidth, setCardWidth] = useState(0);

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

      console.log("題目組：", randomizedCardPairs);
      setRandomCardPairs(randomizedCardPairs);
    }
  }, [quizData, cardsData]);

  // useEffect(() => {
  //   if (cardRef.current) {
  //     setCardWidth(cardRef.current.offsetWidth);
  //   }
  // }, []);

  useEffect(() => {
    let interval;
    console.log(
      "Timer effect running. randomCardPairs:",
      randomCardPairs.length,
      "isGameOver:",
      isGameOver
    );
    if (randomCardPairs.length > 0 && !isGameOver) {
      console.log("Starting timer");
      interval = setInterval(() => {
        setTimer((prevTime) => {
          return prevTime + 10;
        });
      }, 10);
    } else {
      console.log("Clearing timer");
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [randomCardPairs, isGameOver]);

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
      // 如果還沒選滿兩張，繼續選擇
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

  useEffect(() => {
    if (selectedPairs.length === 2) {
      const [firstCard, secondCard] = selectedPairs;

      if (firstCard.cardId === secondCard.cardId) {
        setMatchedPairs((prevMatchedPairs) => [
          ...prevMatchedPairs,
          firstCard,
          secondCard,
        ]);
      }
      setSelectedPairs([]);
    }
  }, [selectedPairs]);

  const isCardMatched = (card) => {
    return matchedPairs.some(
      (matchedCard) =>
        matchedCard.cardId === card.cardId && matchedCard.side === card.side
    );
  };

  useEffect(() => {
    if (
      matchedPairs.length === randomCardPairs.length &&
      randomCardPairs.length > 0
      //避免在初始化的時候就成立
    ) {
      setIsGameOver(true);
    }
  }, [matchedPairs, randomCardPairs.length]);

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
        return (
          <ImageWrapper>
            <Image src={value} alt={field.name} imageStyle={field.style} />
          </ImageWrapper>
        );
      }
      return null;

    default:
      return null;
  }
};

const FieldContainer = styled.div`
  position: absolute;
  display: flex;
  left: ${(props) => `${(props.currentposition.x / 600) * 100}%`};
  top: ${(props) => `${(props.currentposition.y / 400) * 100}%`};
  justify-content: ${(props) => props.currentstyle.textAlign || "center"};
  align-items: center;
  width: ${(props) =>
    props.currentstyle.width
      ? `${(parseInt(props.currentstyle.width) / 600) * 100}%`
      : "auto"};
  height: ${(props) =>
    props.currentstyle.height
      ? `${(parseInt(props.currentstyle.height) / 400) * 100}%`
      : "auto"};

  /* font-size: ${(props) =>
    props.currentstyle.fontSize
      ? `${
          (parseInt(props.currentstyle.fontSize) / 600) *
          (props.actualCardWidth || 600) // 當寬度為 0 時使用默認寬度 600
        }px`
      : "inherit"}; */
  font-weight: ${(props) => props.currentstyle.fontWeight || "normal"};
  color: ${(props) => props.currentstyle.color || "#333"};
  font-style: ${(props) => props.currentstyle.fontStyle || "normal"};
  user-select: none;
`;

// 用於顯示圖片的樣式
const ImageWrapper = styled.div`
  position: relative;
  display: inline-block; // 讓 ImageWrapper 的大小與圖片保持一致
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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
`;

const CardWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: calc(2 / 3 * 100%);
  background-color: ${(props) => props.$style.backgroundColor};
  opacity: ${(props) =>
    props.$isMatched
      ? "0"
      : props.$isSelected
      ? "1"
      : "0.8"}; /* 如果配對，完全透明 */
  pointer-events: ${(props) =>
    props.$isMatched ? "none" : "auto"}; /* 配對後禁用互動 */

  border-radius: ${(props) => props.$style.borderRadius};
  border-style: ${(props) => props.$style.borderStyle};
  border-width: ${(props) => props.$style.borderWidth};
  border-color: ${(props) => props.$style.borderColor};
  font-family: ${(props) => props.$style.fontFamily};
  overflow-y: auto;
  cursor: pointer;
  outline: ${(props) => (props.$isSelected ? "2px solid #4e98dd" : "none")};

  /* 添加動畫效果 */
  transition: transform 0.3s ease, box-shadow 0.3s ease, outline 0.1s ease,
    opacity 0.5s ease; /* 增加 opacity 過渡 */

  /* 選中時的效果 */
  transform: ${(props) => (props.$isSelected ? "translateY(-5px)" : "none")};
  box-shadow: ${(props) =>
    props.$isSelected
      ? "0 4px 8px rgba(0, 0, 0, 0.2)" /* 明顯的陰影效果 */
      : "none"};
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

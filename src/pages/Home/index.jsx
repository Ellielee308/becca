import styled from "styled-components";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  getCardSet,
  getStyle,
  getTemplate,
  getCardsOfCardSet,
} from "../../utils/api";
function Home() {
  const [cardSetData, setCardSetData] = useState(null);
  const [template, setTemplate] = useState(null);
  const [style, setStyle] = useState(null);
  const [cards, setCards] = useState([]);
  useEffect(() => {
    const fetchCardSetData = async () => {
      try {
        const fetchedCardSetData = await getCardSet("PY5V20lv1O0LxwAJ9G0B");
        if (!fetchedCardSetData) throw new Error("Card set not found");

        setCardSetData(fetchedCardSetData);

        const cardStyle = await getStyle(fetchedCardSetData.styleId);
        setStyle(cardStyle);

        const cardTemplate = await getTemplate(
          fetchedCardSetData.fieldTemplateId
        );
        setTemplate(cardTemplate);

        const unorderedCards = await getCardsOfCardSet("PY5V20lv1O0LxwAJ9G0B");

        // 根據 cardSetData.cardOrder 陣列中的順序重排卡片
        const orderedCards = fetchedCardSetData.cardOrder
          .map((cardId) =>
            unorderedCards.find((card) => card.cardId === cardId)
          )
          .filter(Boolean); // 過濾掉可能未找到的卡片

        setCards(orderedCards);
      } catch (error) {
        console.error("獲取卡牌組資料失敗：", error);
      }
    };

    fetchCardSetData();
  }, []);
  return (
    <Wrapper>
      <Notice>點擊可翻轉卡牌</Notice>
      {cardSetData && style && template && cards && (
        <CardContent
          currentStyle={style}
          currentTemplate={template}
          currentCard={cards[0]}
        />
      )}
    </Wrapper>
  );
}

export default Home;

const Wrapper = styled.div`
  margin: 80px auto 20px auto;
  padding: 20px 20px;
  max-width: 1160px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 100vh;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Notice = styled.div`
  width: 600px;
  display: flex;
  justify-content: flex-end; /* 內容靠右 */
  align-items: flex-start; /* 讓文字靠上（不置中） */
  text-align: right; /* 確保文字在元素內部靠右對齊 */
  color: #afafaf;
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
                  style={field.style}
                  position={field.position}
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
                  style={field.style}
                  position={field.position}
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
        return (
          <ImageWrapper>
            <Image src={value} alt={field.name} style={field.style} />
          </ImageWrapper>
        );
      }
      return null;

    default:
      return null;
  }
};

const CardViewWrapper = styled.div`
  align-self: center;
  display: block;
  margin: 20px 0px;
  width: 600px;
  height: 400px;
  perspective: 1000px;
  transform-style: preserve-3d;
  cursor: pointer;
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
  justify-content: ${(props) => props.style.textAlign || "center"};
  align-items: center;
  ${(props) =>
    props.style &&
    `
    width: ${props.style.width};
    height: ${props.style.height};
    font-size: ${props.style.fontSize};
    font-weight: ${props.style.fontWeight};
    color: ${props.style.color};
    background-color: ${props.style.backgroundColor};
  `};
  left: ${(props) => props.position?.x || "0"}px;
  top: ${(props) => props.position?.y || "0"}px;
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
  object-fit: ${(props) => props.style?.objectFit || "cover"};
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
          x: PropTypes.number.isRequired,
          y: PropTypes.number.isRequired,
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
          x: PropTypes.number.isRequired,
          y: PropTypes.number.isRequired,
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
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

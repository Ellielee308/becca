import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { updateQuiz } from "../../utils/api";

const formatTime = (time) => {
  const minutes = String(Math.floor(time / 60000)).padStart(2, "0"); // 分鐘
  const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, "0"); // 秒
  const milliseconds = String(Math.floor((time % 1000) / 100));
  return `${minutes}:${seconds}.${milliseconds}`;
};

function MultipleChoices({ quizData, cardsData, template, style }) {
  const [timer, setTimer] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAttempt, setCorrectAttempt] = useState(0);
  const [wrongCards, setWrongCards] = useState([]);

  //Initialize questions
  useEffect(() => {
    if (quizData && cardsData.length > 0) {
      const questionNumber = quizData.questionQty;
      const shuffledCards = [...cardsData].sort(() => 0.5 - Math.random());
      const selectedQuestionCards = shuffledCards.slice(0, questionNumber);
      setQuizQuestions(selectedQuestionCards);
    }
  }, [quizData, cardsData]);

  useEffect(() => {
    if (
      quizQuestions.length > 0 &&
      currentQuestionNumber < quizQuestions.length
    ) {
      const currentCard = quizQuestions[currentQuestionNumber];

      let incorrectOptions = cardsData
        .filter((card) => card.cardId !== currentCard.cardId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const correctOption = { ...currentCard };

      const allOptions = [...incorrectOptions, correctOption].sort(
        () => 0.5 - Math.random()
      );
      setOptions(allOptions);
    }
  }, [quizQuestions, cardsData, currentQuestionNumber]);

  const handleAnswerSelect = (selectedOption) => {
    setSelectedAnswer(selectedOption);

    const correctAnswer = quizQuestions[currentQuestionNumber];
    if (selectedOption.cardId === correctAnswer.cardId) {
      setCorrectAttempt((prev) => prev + 1);
    } else {
      setWrongCards((prev) => [...prev, correctAnswer]);
    }
    // 延遲進入下一個問題，並重置選擇狀態
    setTimeout(() => {
      if (currentQuestionNumber + 1 < quizQuestions.length) {
        setCurrentQuestionNumber(currentQuestionNumber + 1);
        setSelectedAnswer(null);
      } else {
        setIsGameOver(true);
        const timeUsed = timer;
        const accuracy = (
          (correctAttempt / quizData.questionQty) *
          100
        ).toFixed(2);
        const correctAttempts = correctAttempt;

        const quizId = quizData.quizId;
        updateQuiz(quizId, {
          timeUsed,
          accuracy,
          correctAttempts,
        });
      }
    }, 1000);
  };

  useEffect(() => {
    let interval;
    if (quizQuestions.length > 0 && !isGameOver) {
      interval = setInterval(() => {
        setTimer((prevTime) => {
          return prevTime + 10;
        });
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [quizQuestions, isGameOver]);

  const getOutlineColorWhenSelected = (option) => {
    const correctAnswer = quizQuestions[currentQuestionNumber];

    if (selectedAnswer?.cardId === option.cardId) {
      return option.cardId === correctAnswer.cardId ? "green" : "red";
    }

    return "transparent";
  };

  const accuracy = ((correctAttempt / quizData.questionQty) * 100).toFixed(2);

  return (
    <Wrapper>
      <QuestionWrapper>
        <QuestionSection>
          <QuestionCardWrapper $style={style}>
            {quizQuestions.length > 0 &&
              template.frontFields.map((frontField, index) => (
                <FieldContainer
                  key={index}
                  $style={frontField.style}
                  $position={frontField.position}
                >
                  {renderFieldContent(
                    frontField,
                    quizQuestions[currentQuestionNumber].frontFields[index]
                      ? quizQuestions[currentQuestionNumber].frontFields[index]
                          .value
                      : ""
                  )}
                </FieldContainer>
              ))}
          </QuestionCardWrapper>
        </QuestionSection>
        <QuestionNumber>{`${currentQuestionNumber + 1} / ${
          quizData.questionQty
        }`}</QuestionNumber>
        <Note>
          <ClickIcon />
          點擊對應的卡片
        </Note>
        <ChoicesWrapper>
          {options.length > 0 &&
            options.map((option, index) => (
              <ChoiceCard
                key={`${option.cardSetId}-${index}`}
                onClick={() => handleAnswerSelect(option)}
                $outlineColor={getOutlineColorWhenSelected(option)}
              >
                {template.backFields.map((backField, index) => {
                  if (backField.type === "text") {
                    return (
                      <TextWrapper key={index}>
                        {option.backFields[index].value}
                      </TextWrapper>
                    );
                  } else if (backField.type === "image") {
                    if (
                      option.backFields[index]?.value &&
                      option.backFields[index].value.trim() !== ""
                    ) {
                      return (
                        <ImagePreview
                          key={index}
                          src={option.backFields[index].value}
                          alt={backField.name}
                        />
                      );
                    }
                  }
                  return null; // 確保沒有返回 undefined
                })}
              </ChoiceCard>
            ))}
        </ChoicesWrapper>
      </QuestionWrapper>
      <Timer>{formatTime(timer)}</Timer>
      {quizQuestions.length > 0 && isGameOver && (
        <QuizResultModal
          timer={timer}
          accuracy={accuracy}
          cardSetId={quizData.cardSetId}
          wrongCards={wrongCards}
          template={template}
        />
      )}
    </Wrapper>
  );
}

export default MultipleChoices;

MultipleChoices.propTypes = {
  quizData: PropTypes.object,
  cardsData: PropTypes.array,
  template: PropTypes.object,
  style: PropTypes.object,
};

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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: fit-content;
  width: 100%;
`;

const Timer = styled.div`
  align-self: center;
  font-size: 18px;
  color: gray;
  font-family: monospace;
`;

const QuestionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0px 0 24px 0;
`;

const QuestionSection = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
`;

const QuestionNumber = styled.p`
  font-size: 14px;
  color: gray;
  opacity: 0.6;
  user-select: none;
  white-space: pre-line;
`;

const QuestionCardWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 480px;
  height: 320px;
  margin-bottom: 24px;
  border-style: ${(props) => props.$style.borderStyle};
  border-color: ${(props) => props.$style.borderColor};
  border-width: ${(props) => props.$style.borderWidth};
  background-color: ${(props) => props.$style.backgroundColor};
  border-radius: ${(props) => props.$style.borderRadius};
  font-family: ${(props) => props.$style.fontFamily};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15);
  @media only screen and (max-width: 639px) {
    width: 90vw;
    aspect-ratio: 3 / 2;
    height: auto;
  }
`;

const ChoicesWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 16px auto 0 auto;
  width: 100%;
  @media only screen and (max-width: 639px) {
    grid-template-columns: 1fr;
  }
`;

const ChoiceCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  min-height: 150px;
  padding: 10px 20px 10px 20px;
  border-radius: 8px;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  outline: ${(props) => props.$outlineColor} 2px solid;
  transition: box-shadow 0.3s ease, transform 0.3s ease, outline 0.3s ease;
  background-color: #fff;

  /* 懸停效果 */
  &:hover {
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
    transform: translateY(-3px); /* 微微上升 */
  }

  /* 點擊效果 */
  &:active {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    transform: scale(0.98); /* 輕微縮放效果 */
  }
`;

const Note = styled.p`
  font-size: 18px;
  align-self: flex-start;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
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

const ImageWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
`;

const TextWrapper = styled.div`
  font-size: 16px;
  line-height: 30px;
  border-bottom: 1px solid #c0c5c5;
  text-align: center;
`;

const ImagePreview = styled.img`
  height: 80px;
  width: auto;
  margin: 0 auto;
`;

const ClickIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
  >
    <path
      fillRule="evenodd"
      d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.06 0Z"
      clipRule="evenodd"
    />
  </svg>
);

const QuizResultModal = ({
  timer,
  accuracy,
  cardSetId,
  wrongCards,
  template,
}) => {
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
        <Title>答錯題目：</Title>
        <ListSection>
          {wrongCards.map((card) => (
            <CardWrapper key={card.cardId}>
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
  width: 500px;
  max-height: 640px;
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
  accuracy: PropTypes.string.isRequired,
  cardSetId: PropTypes.string.isRequired,
  template: PropTypes.object,
  wrongCards: PropTypes.array,
};

const ListSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 16px;
`;

const CardWrapper = styled.div`
  padding: 20px 30px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const CardContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

const SideSplit = styled.div`
  height: 90px;
  border-left: 1px solid #c9c5c5;
  align-self: center;
  margin: 0px 30px;
`;

const SideHeading = styled.p`
  font-size: 16px;
  margin-bottom: 12px;
  color: #696767;
`;

// const TextWrapper = styled.div`
//   font-size: 16px;
//   line-height: 30px;
//   border-bottom: 1px solid #c0c5c5;
// `;

// const ImagePreview = styled.img`
//   height: 80px;
//   width: auto;
//   margin: 0 auto;
// `;

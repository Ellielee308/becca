import { message } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useUser } from "../../context/UserContext.jsx";
import { createGameWithQuestion } from "../../utils/api.js";

const CreateGameModal = ({
  onClose,
  quizType,
  totalCardsNumber,
  cardSetId,
  cards,
}) => {
  const { user } = useUser();
  const [invalidTime, setInvalidTime] = useState(false);
  const [newGameData, setNewGameData] = useState({
    gameId: "",
    roomName: "",
    hostUserId: "",
    cardSetId: cardSetId,
    quizType: quizType,
    questionQty: quizType === "multipleChoices" ? 1 : 4,
    timeLimit: 120,
    status: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setNewGameData((prevData) => ({ ...prevData, hostUserId: user.userId }));
    }
  }, [user]);

  const handleQtyChange = (e) => {
    setNewGameData((prevData) => ({
      ...prevData,
      questionQty: e.target.value,
    }));
  };

  if (!user || !totalCardsNumber || !cardSetId) {
    return;
  }
  const headingText =
    quizType === "multipleChoices" ? "創建選擇題遊戲" : "創建配對題遊戲";

  const generateMatchingOptions = () => {
    const options = [];
    if (totalCardsNumber >= 4) options.push(4);
    if (totalCardsNumber >= 6) options.push(6);
    if (totalCardsNumber >= 8) options.push(8);
    if (totalCardsNumber >= 10) options.push(10);
    return options;
  };

  const handleTimeChange = (minutes, seconds) => {
    const totalSeconds = minutes * 60 + seconds;
    setNewGameData((prev) => ({
      ...prev,
      timeLimit: totalSeconds,
    }));
  };

  const handleSumbit = async (event) => {
    event.preventDefault();
    setInvalidTime(false);
    if (newGameData.timeLimit < 20) {
      setInvalidTime(true);
      return;
    }

    let questions;
    let questionData;

    if (newGameData.quizType === "matching") {
      questions = createMatchingQuestions(cards);
      questionData = { quizType: "matching", questions };
    } else if (newGameData.quizType === "multipleChoices") {
      questions = createMultipleChoicesQuestions(cards);
      questionData = { quizType: "multipleChoices", questions };
    }

    try {
      const gameId = await createGameWithQuestion(newGameData, questionData);
      if (gameId) {
        message.success("創建遊戲成功");
        navigate(`/game/${gameId}`);
      } else {
        message.error("創建遊戲失敗，請稍後再試！");
      }
    } catch (error) {
      console.error("提交遊戲資料時出現錯誤：", error);
    }
  };

  const createMultipleChoicesQuestions = (cards) => {
    const questionNumber = newGameData.questionQty;
    const shuffledCards = [...cards].sort(() => 0.5 - Math.random());
    const selectedQuestionCards = shuffledCards.slice(0, questionNumber);

    const questionData = selectedQuestionCards.map((currentCard) => {
      let incorrectOptions = cards
        .filter((card) => card.cardId !== currentCard.cardId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const correctOption = { ...currentCard };
      const allOptions = [...incorrectOptions, correctOption].sort(
        () => 0.5 - Math.random()
      );

      return {
        questionId: currentCard.cardId,
        frontFields: currentCard.frontFields,
        options: allOptions.map((option) => ({
          cardId: option.cardId,
          backFields: option.backFields,
        })),
        correctAnswerId: correctOption.cardId,
      };
    });

    return questionData;
  };

  const createMatchingQuestions = (cards) => {
    const pairNumbers = newGameData.questionQty;
    const shuffledCards = [...cards].sort(() => 0.5 - Math.random());
    const selectedPairs = shuffledCards.slice(0, pairNumbers);

    const cardPairs = selectedPairs.flatMap((card) => [
      { cardId: card.cardId, fields: card.frontFields, side: "front" },
      { cardId: card.cardId, fields: card.backFields, side: "back" },
    ]);

    const randomizedCardPairs = cardPairs.sort(() => 0.5 - Math.random());

    return randomizedCardPairs;
  };

  return (
    <ModalWrapper>
      <ModalContent>
        <Form onSubmit={handleSumbit}>
          <Heading>{headingText}</Heading>
          {quizType && quizType === "multipleChoices" && (
            <>
              <Label htmlFor="roomName">遊戲房名稱</Label>
              <RoomNameInput
                type="text"
                id="roomName"
                onChange={(e) => {
                  setNewGameData((prev) => ({
                    ...prev,
                    roomName: e.target.value,
                  }));
                }}
                value={newGameData.roomName}
              />
              <Label>題目數量</Label>
              <QuestionQtySelectWrapper>
                <QuestionQtySelect
                  value={newGameData.questionQty}
                  onChange={handleQtyChange}
                >
                  {Array.from({ length: totalCardsNumber }).map((_, index) => (
                    <QtyOption key={index} value={index + 1}>
                      {index + 1}
                    </QtyOption>
                  ))}
                </QuestionQtySelect>
              </QuestionQtySelectWrapper>
              <Label htmlFor="time">時間限制（最少為20秒）</Label>
              <GameTimeInput onTimeChange={handleTimeChange} />
            </>
          )}
          {quizType && quizType === "matching" && (
            <>
              <Label htmlFor="roomName">遊戲房名稱</Label>
              <RoomNameInput
                type="text"
                id="roomName"
                onChange={(e) => {
                  setNewGameData((prev) => ({
                    ...prev,
                    roomName: e.target.value,
                  }));
                }}
                value={newGameData.roomName}
              />
              <Label>配對卡牌數</Label>
              <QuestionQtySelectWrapper>
                <QuestionQtySelect
                  value={newGameData.questionQty}
                  onChange={handleQtyChange}
                >
                  {generateMatchingOptions().map((option) => (
                    <QtyOption key={option} value={option}>
                      {option}
                    </QtyOption>
                  ))}
                </QuestionQtySelect>
              </QuestionQtySelectWrapper>
              <Label htmlFor="time">時間限制（最少為20秒）</Label>
              <GameTimeInput onTimeChange={handleTimeChange} />
            </>
          )}
          {invalidTime && (
            <InvalidTimeNotice>
              遊戲時間最少為20秒，請重新設定
            </InvalidTimeNotice>
          )}
          <CreateButton type="submit" value="創建遊戲" />
        </Form>
        <CloseIcon onClick={onClose}>×</CloseIcon>
      </ModalContent>
    </ModalWrapper>
  );
};

export default CreateGameModal;

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
  padding: 40px;
  border-radius: 8px;
  width: 400px;
  height: 400px;
  position: relative;
  overflow-y: auto;
`;

const Heading = styled.h3`
  font-size: 20px;
  margin-bottom: 30px;
`;

const CloseIcon = styled.p`
  position: absolute;
  color: black;
  right: 20px;
  top: 20px;
  font-size: 28px;
  font-weight: 600;
  cursor: pointer;
`;

const Label = styled.label`
  margin-bottom: 12px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const RoomNameInput = styled.input`
  width: 100%;
  height: 32px;
  margin-bottom: 12px;
  border-radius: 8px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const QuestionQtySelectWrapper = styled.div`
  position: relative;
  display: block;
  width: 80px;
  height: 32px;
  margin-bottom: 12px;
  &:after {
    content: "ˇ";
    position: absolute;
    right: 8px;
    top: 20px;
    transform: translateY(-50%);
    pointer-events: none;
    color: #3f3a3a;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
    text-align: center;
  }
`;

const QuestionQtySelect = styled.select`
  font-size: 14px;
  padding: 0px 0px 0px 15px;
  width: 80px;
  height: 32px;
  border: 1px solid #979797;
  border-radius: 8px;
  background-color: #f3f3f3;
  appearance: none;
  &:focus {
    outline: none;
  }
`;

const QtyOption = styled.option`
  color: #3f3a3a;
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  text-align: left;
`;

const InvalidTimeNotice = styled.div`
  font-size: 12px;
  color: #ff6f61;
  margin: 8px 0;
`;

const CreateButton = styled.input`
  padding: 12px 24px;
  font-size: 16px;
  color: white;
  background-color: #3d5a80;
  border: none;
  border-radius: 8px;
  margin-top: auto;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;

  &:hover {
    background-color: #4a88c6;
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    background-color: #bfbfbf;
    cursor: not-allowed;
  }
`;

CreateGameModal.propTypes = {
  onClose: PropTypes.func,
  quizType: PropTypes.string,
  totalCardsNumber: PropTypes.number,
  cardSetId: PropTypes.string,
  cards: PropTypes.array,
};

const GameTimeInput = ({ onTimeChange }) => {
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);

  const handleMinutesChange = (e) => {
    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    setMinutes(value);
    setTimeout(() => {
      onTimeChange(value, seconds);
    }, 0);
  };

  const handleSecondsChange = (e) => {
    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    setSeconds(value);
    setTimeout(() => {
      onTimeChange(minutes, value);
    }, 0);
  };

  return (
    <InputContainer>
      <InputGroup>
        <Input
          type="number"
          id="minutes"
          min="0"
          max="10"
          value={minutes}
          onChange={handleMinutesChange}
        />
        <TimeLabel htmlFor="minutes">分鐘</TimeLabel>
      </InputGroup>
      <InputGroup>
        <Input
          type="number"
          id="seconds"
          min="0"
          max="59"
          value={seconds}
          onChange={handleSecondsChange}
        />
        <TimeLabel htmlFor="seconds">秒鐘</TimeLabel>
      </InputGroup>
    </InputContainer>
  );
};

GameTimeInput.propTypes = {
  onTimeChange: PropTypes.func,
};

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TimeLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-left: 4px;
`;

const Input = styled.input`
  width: 5rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

import { message } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useUser } from "../../context/UserContext.jsx";
import { createQuiz } from "../../utils/api.js";

const CreateQuizModal = ({
  onClose,
  quizType,
  totalCardsNumber,
  cardSetId,
}) => {
  const { user } = useUser();
  const [newQuizData, setNewQuizData] = useState({
    userId: "",
    cardSetId: cardSetId,
    quizType: quizType,
    questionQty: quizType === "multipleChoices" ? 1 : 4,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setNewQuizData((prevData) => ({ ...prevData, userId: user.userId }));
    }
  }, [user]);

  const handleQtyChange = (e) => {
    setNewQuizData((prevData) => ({
      ...prevData,
      questionQty: e.target.value,
    }));
  };

  if (!user || !totalCardsNumber || !cardSetId) {
    return;
  }
  const headingText =
    quizType === "multipleChoices" ? "創建選擇題" : "創建配對題";

  const generateMatchingOptions = () => {
    const options = [];
    if (totalCardsNumber >= 4) options.push(4);
    if (totalCardsNumber >= 6) options.push(6);
    if (totalCardsNumber >= 8) options.push(8);
    if (totalCardsNumber >= 10) options.push(10);
    return options;
  };

  const handleSumbit = async (event) => {
    event.preventDefault();
    try {
      const quizId = await createQuiz(newQuizData);
      if (quizId) {
        navigate(`/quiz/${quizId}`);
      } else {
        message.error("測驗創建失敗，請稍後再試");
      }
    } catch (error) {
      console.error("提交測驗時出現錯誤：", error);
    }
  };
  return (
    <ModalWrapper>
      <ModalContent>
        <Form onSubmit={handleSumbit}>
          <Heading>{headingText}</Heading>
          {quizType && quizType === "multipleChoices" && (
            <>
              <Label>題目數量</Label>
              <QuestionQtySelectWrapper>
                <QuestionQtySelect
                  value={newQuizData.questionQty}
                  onChange={handleQtyChange}
                >
                  {Array.from({ length: totalCardsNumber }).map((_, index) => (
                    <QtyOption key={index} value={index + 1}>
                      {index + 1}
                    </QtyOption>
                  ))}
                </QuestionQtySelect>
              </QuestionQtySelectWrapper>
            </>
          )}
          {quizType && quizType === "matching" && (
            <>
              <Label>配對卡牌數</Label>
              <QuestionQtySelectWrapper>
                <QuestionQtySelect
                  value={newQuizData.questionQty}
                  onChange={handleQtyChange}
                >
                  {generateMatchingOptions().map((option) => (
                    <QtyOption key={option} value={option}>
                      {option}
                    </QtyOption>
                  ))}
                </QuestionQtySelect>
              </QuestionQtySelectWrapper>
            </>
          )}
          <CreateButton type="submit" value="開始測驗" />
        </Form>
        <CloseIcon onClick={onClose}>×</CloseIcon>
      </ModalContent>
    </ModalWrapper>
  );
};

export default CreateQuizModal;

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
  height: 280px;
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

const Label = styled.label``;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const QuestionQtySelectWrapper = styled.div`
  position: relative;
  display: block;
  width: 80px;
  height: 32px;
  margin-top: 16px;
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

CreateQuizModal.propTypes = {
  onClose: PropTypes.func,
  quizType: PropTypes.string,
  totalCardsNumber: PropTypes.number,
  cardSetId: PropTypes.string,
};

import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getQuiz,
  getCardSet,
  getCardsOfCardSet,
  getTemplate,
  getStyle,
} from "../../utils/api";
import Matching from "./Matching";
import MultipleChoices from "./MultipleChoices";

function Quiz() {
  const { quizId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [cardSetData, setCardSetData] = useState(null);
  const [cardsData, setCardsData] = useState(null);
  const [style, setStyle] = useState(null);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;

      try {
        const quizData = await getQuiz(quizId);
        if (quizData) {
          setQuizData(quizData);

          const [cardSetData, cardsData] = await Promise.all([
            getCardSet(quizData.cardSetId),
            getCardsOfCardSet(quizData.cardSetId),
          ]);

          setCardSetData(cardSetData);
          setCardsData(cardsData);

          const [template, style] = await Promise.all([
            getTemplate(cardSetData.fieldTemplateId),
            getStyle(cardSetData.styleId),
          ]);
          setTemplate(template);
          setStyle(style);
        }
      } catch (error) {
        console.error("設置測驗的時候發生錯誤", error);
      }
    };

    fetchQuizData();
  }, [quizId]);

  if (
    !quizId ||
    !quizData ||
    !cardSetData ||
    !cardsData ||
    !template ||
    !style
  ) {
    return <div>Loading...</div>;
  }
  return (
    <Wrapper>
      <QuizDescription>
        <Title>{cardSetData.title}</Title>
        <QuizTypeDescription>
          {quizData.quizType === "matching" ? "配對測驗" : "選擇題測驗"}
        </QuizTypeDescription>
      </QuizDescription>
      {quizData.quizType === "matching" ? (
        <Matching
          quizData={quizData}
          cardsData={cardsData}
          template={template}
          style={style}
        />
      ) : (
        <MultipleChoices
          quizData={quizData}
          cardsData={cardsData}
          template={template}
          style={style}
        />
      )}
    </Wrapper>
  );
}

export default Quiz;

const Wrapper = styled.div`
  margin: 80px auto;
  padding: 30px 20px;
  max-width: 1160px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const QuizDescription = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60%;
  margin: 32px auto;
  user-select: none;
`;

const Title = styled.p`
  font-size: 24px;
  margin-bottom: 16px;
`;

const QuizTypeDescription = styled.p`
  font-size: 20px;
`;
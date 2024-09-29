import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getGameDoc,
  getGameQuestions,
  getCardSet,
  getCardsOfCardSet,
  getTemplate,
  getStyle,
} from "../../utils/api";

function Game() {
  const { gameId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [gameQuestionData, setGameQuestionData] = useState(null);
  const [cardSetData, setCardSetData] = useState(null);
  const [cardsData, setCardsData] = useState(null);
  const [style, setStyle] = useState(null);
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId) return;

      try {
        const gameData = await getGameDoc(gameId);
        if (gameData) {
          setGameData(gameData);

          const [gameQuestionData, cardSetData, cardsData] = await Promise.all([
            getGameQuestions(gameData.gameQuestionId),
            getCardSet(gameData.cardSetId),
            getCardsOfCardSet(gameData.cardSetId),
          ]);

          setGameQuestionData(gameQuestionData);
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
        console.error("設置遊戲的時候發生錯誤", error);
      }
    };

    fetchGameData();
  }, [gameId]);

  if (
    !gameId ||
    !gameData ||
    !gameQuestionData ||
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
        <Title>
          遊戲房：{gameData.roomName ? gameData.roomName : "無名稱"}
        </Title>
        <QuizTypeDescription>
          {gameData.quizType === "matching" ? "配對小遊戲" : "選擇題小遊戲"}
        </QuizTypeDescription>
      </QuizDescription>
      {/* {gameData.quizType === "matching" ? (
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
      )} */}
    </Wrapper>
  );
}

export default Game;

const Wrapper = styled.div`
  margin: 100px auto 120px auto;
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

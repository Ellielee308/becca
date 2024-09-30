import styled from "styled-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { updateParticipantDoc, getParticipantDoc } from "../../utils/api";

const formatTime = (time) => {
  const minutes = String(Math.floor(time / 60000)).padStart(2, "0"); // 分鐘
  const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, "0"); // 秒
  const milliseconds = String(Math.floor((time % 1000) / 100));
  return `${minutes}:${seconds}.${milliseconds}`;
};

function MultipleChoices({
  gameData,
  gameQuestionData,
  template,
  style,
  participantId,
}) {
  const [timer, setTimer] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAttempt, setCorrectAttempt] = useState(0);

  const handleAnswerSelect = async (selectedOption) => {
    console.log(selectedOption);
    setSelectedAnswer(selectedOption);

    const correctAnswerId =
      gameQuestionData.questions[currentQuestionNumber].correctAnswerId;

    let newCorrectAttempt = correctAttempt;

    if (selectedOption.cardId === correctAnswerId) {
      console.log("答對了！");
      newCorrectAttempt += 1;
      setCorrectAttempt(newCorrectAttempt);
    } else {
      console.log("答錯了！");
    }

    // 更新 Firestore 中的參賽者文檔
    try {
      await updateParticipantDoc(participantId, {
        currentScore: newCorrectAttempt,
      });
    } catch (error) {
      console.error("更新玩家分數失敗：", error);
    }

    // 延遲進入下一個問題，並重置選擇狀態
    setTimeout(() => {
      if (currentQuestionNumber + 1 < gameData.questionQty) {
        setCurrentQuestionNumber(currentQuestionNumber + 1);
        setSelectedAnswer(null);
      } else {
        setIsGameOver(true);
        const timeUsed = timer;
        const accuracy = (
          (correctAttempt / gameData.questionQty) *
          100
        ).toFixed(2);
        try {
          updateParticipantDoc(participantId, {
            timeUsed: timeUsed,
            currentScore: newCorrectAttempt,
            accuracy: parseFloat(accuracy),
          });
          console.log("已成功記錄玩家完成狀態");
        } catch (error) {
          console.error("記錄完成狀態失敗：", error);
        }
      }
    }, 1000);
  };

  useEffect(() => {
    let interval;
    console.log(
      "Timer effect running. randomCardPairs:",
      gameQuestionData.questions.length,
      "isGameOver:",
      isGameOver
    );
    if (
      gameQuestionData.questions.length > 0 &&
      !isGameOver &&
      gameData.status === "in-progress"
    ) {
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
  }, [gameQuestionData, isGameOver, gameData.status]);

  const getOutlineColorWhenSelected = (option) => {
    const correctAnswerId =
      gameQuestionData.questions[currentQuestionNumber].correctAnswerId;

    if (selectedAnswer?.cardId === option.cardId) {
      return option.cardId === correctAnswerId ? "green" : "red";
    }

    return "transparent";
  };

  const accuracy = ((correctAttempt / gameData.questionQty) * 100).toFixed(2);

  return (
    <Wrapper>
      <QuestionWrapper>
        <QuestionSection>
          <QuestionCardWrapper $style={style}>
            {gameQuestionData.questions.length > 0 &&
              template.frontFields.map((frontField, index) => (
                <FieldContainer
                  key={index}
                  $style={frontField.style}
                  $position={frontField.position}
                >
                  {renderFieldContent(
                    frontField,
                    gameQuestionData.questions[currentQuestionNumber]
                      .frontFields[index]
                      ? gameQuestionData.questions[currentQuestionNumber]
                          .frontFields[index].value
                      : ""
                  )}
                </FieldContainer>
              ))}
          </QuestionCardWrapper>
          <QuestionNumber>{`${currentQuestionNumber + 1} / ${
            gameData.questionQty
          }`}</QuestionNumber>
        </QuestionSection>
        <Note>點擊對應的卡片</Note>
        <ChoicesWrapper>
          {gameQuestionData.questions.length > 0 &&
            gameQuestionData.questions[currentQuestionNumber].options.map(
              (option, index) => (
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
              )
            )}
        </ChoicesWrapper>
      </QuestionWrapper>
      {(isGameOver || gameData.status === "completed") && (
        <GameEndModal
          gameStatus={gameData.status}
          gameData={gameData}
          participantId={participantId}
          correctAttempt={correctAttempt}
          timer={timer}
        />
      )}
    </Wrapper>
  );
}

export default MultipleChoices;

MultipleChoices.propTypes = {
  gameData: PropTypes.object,
  gameQuestionData: PropTypes.object,
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
  margin: 16px 0 24px 0;
`;

const QuestionSection = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
`;

const QuestionNumber = styled.p`
  position: absolute;
  top: 8px;
  right: 8px;
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
`;

const ChoicesWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 16px auto 0 auto;
  width: 100%;
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
`;

const FieldContainer = styled.div`
  position: absolute;
  display: flex;
  left: ${(props) => `${(props.$position.x / 600) * 100}%`};
  top: ${(props) => `${(props.$position.y / 400) * 100}%`};
  justify-content: ${(props) => props.$style.textAlign || "center"};
  align-items: center;
  width: ${(props) =>
    props.$style.width
      ? `${(parseInt(props.$style.width) / 600) * 100}%`
      : "auto"};
  height: ${(props) =>
    props.$style.height
      ? `${(parseInt(props.$style.height) / 400) * 100}%`
      : "auto"};
  font-size: ${(props) =>
    props.$style.fontSize
      ? `${(parseInt(props.$style.fontSize) / 600) * 480}px`
      : "inherit"};
  font-weight: ${(props) => props.$style.fontWeight || "normal"};
  color: ${(props) => props.$style.color || "#333"};
  font-style: ${(props) => props.$style.fontStyle || "normal"};
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

const GameEndModal = ({ gameStatus, gameData, correctAttempt, timer }) => {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 當遊戲完成後，獲取所有玩家的成績並排序
  useEffect(() => {
    if (gameStatus === "completed" && gameData?.players.length > 0) {
      const fetchPlayerRankings = async () => {
        setIsLoading(true);
        try {
          const playerDetails = await Promise.all(
            gameData.players.map(async (player) => {
              const participant = await getParticipantDoc(player.participantId);
              return {
                username: player.username,
                score: participant?.currentScore || 0,
                timeUsed: participant?.timeUsed || 0,
              };
            })
          );

          // 排序邏輯：根據分數（由高到低）和時間（由少到多）
          playerDetails.sort((a, b) => {
            if (b.score === a.score) {
              return a.timeUsed - b.timeUsed;
            }
            return b.score - a.score;
          });

          setRankings(playerDetails);
        } catch (error) {
          console.error("獲取玩家排名失敗：", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchPlayerRankings();
    }
  }, [gameStatus, gameData]);

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60000)).padStart(2, "0"); // 分鐘
    const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, "0"); // 秒
    return `${minutes} 分 ${seconds} 秒`;
  };

  return (
    <ModalWrapper>
      <ModalContent>
        {gameStatus === "in-progress" && (
          <WaitingWrapper>
            <h2>遊戲完成！</h2>
            <p>答對題數：{correctAttempt}</p>
            <p>花費時間：{formatTime(timer)}</p>
            <p>等待遊戲結束中...</p>
          </WaitingWrapper>
        )}
        {gameStatus === "completed" && (
          <>
            <RankingTitle>排行榜</RankingTitle>
            {isLoading ? (
              <p>加載中...</p>
            ) : (
              <RankingList>
                {rankings.map((player, index) => (
                  <RankingItem key={index}>
                    {`第${index + 1}名 ${player.username} - 得分: ${
                      player.score
                    }, 用時: ${formatTime(player.timeUsed)}`}
                  </RankingItem>
                ))}
              </RankingList>
            )}
            <CloseButton
              onClick={() => {
                navigate("/");
              }}
            >
              離開
            </CloseButton>
          </>
        )}
      </ModalContent>
    </ModalWrapper>
  );
};

const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  min-height: 360px;
`;
const WaitingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const RankingTitle = styled.h2`
  font-size: 20px;
`;

const RankingList = styled.ul`
  margin-top: 20px;
  list-style: none;
  padding: 0;
`;

const RankingItem = styled.li`
  margin: 10px 0;
`;

const CloseButton = styled.button`
  align-self: center;
  width: 50%;
  margin-top: auto;
  padding: 12px 25px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #92a3fd, #adbce5);
  color: white;
  font-size: 16px;
  font-family: "Noto Sans TC", sans-serif;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease; /* 增加過渡效果使變化更柔和 */

  &:hover {
    background: linear-gradient(135deg, #8292f1, #9bb0eb);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #7282e0, #8ea6d6);
  }
`;

import styled from "styled-components";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { updateParticipantDoc, getParticipantDoc } from "../../utils/api";
import { serverTimestamp } from "firebase/firestore";

function Matching({
  gameData,
  gameQuestionData,
  template,
  style,
  participantId,
}) {
  const [selectedPairs, setSelectedPairs] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [pairStatus, setPairStatus] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const updateFirestore = useCallback(
    async (newScore) => {
      try {
        await updateParticipantDoc(participantId, {
          currentScore: newScore,
        });
        console.log("Successfully updated participant's score");
      } catch (error) {
        console.error("Failed to update player score:", error);
      }
    },
    [participantId]
  );

  useEffect(() => {
    if (selectedPairs.length === 2) {
      const [firstCard, secondCard] = selectedPairs;

      setTimeout(() => {
        if (firstCard.cardId === secondCard.cardId) {
          setMatchedPairs((prevMatchedPairs) => {
            const newMatchedPairs = [
              ...prevMatchedPairs,
              firstCard,
              secondCard,
            ];
            const newScore = newMatchedPairs.length / 2;

            // 在狀態更新後更新 Firestore
            setTimeout(() => {
              updateFirestore(newScore);
            }, 0);

            return newMatchedPairs;
          });
          setPairStatus("success");
        } else {
          setPairStatus("fail");
        }

        setTimeout(() => {
          setSelectedPairs([]);
          setPairStatus(null);
        }, 500);
      }, 500);
    }
  }, [selectedPairs, updateFirestore]);

  useEffect(() => {
    const updateGameCompletion = async () => {
      if (
        matchedPairs.length === gameQuestionData.questions.length &&
        gameQuestionData.questions.length > 0 &&
        !isGameOver
      ) {
        setIsGameOver(true);
        try {
          await updateParticipantDoc(participantId, {
            gameEndedAt: serverTimestamp(),
            currentScore: matchedPairs.length / 2,
          });
          console.log("玩家已完成遊戲，已更新分數和時間");
        } catch (error) {
          console.error("更新玩家分數失敗：", error);
        }
      }
    };

    updateGameCompletion();
  }, [
    matchedPairs.length,
    gameQuestionData.questions.length,
    isGameOver,
    participantId,
  ]);

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

  return (
    <Wrapper>
      <CardGridWrapper>
        {gameQuestionData.questions.length > 0 &&
          template &&
          gameQuestionData.questions.map((question) => (
            <CardWrapper
              key={`${question.cardId}-${question.side}`}
              $style={style}
              onClick={() =>
                handleSelect({
                  cardId: question.cardId,
                  side: question.side,
                })
              }
              $isSelected={isCardSelected({
                cardId: question.cardId,
                side: question.side,
              })}
              $isMatched={isCardMatched({
                cardId: question.cardId,
                side: question.side,
              })}
              $outlineColor={getOutlineColor(
                isCardMatched({
                  cardId: question.cardId,
                  side: question.side,
                }),
                isCardSelected({
                  cardId: question.cardId,
                  side: question.side,
                }),
                pairStatus
              )}
            >
              <CardContent>
                {question.side === "front"
                  ? template.frontFields.map((frontField, index) => (
                      <FieldContainer
                        key={index}
                        currentstyle={frontField.style}
                        currentposition={frontField.position}
                        // actualCardWidth={cardWidth} // 傳入實際卡片寬度
                      >
                        {renderFieldContent(
                          frontField,
                          question.fields[index]
                            ? question.fields[index].value
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
                          question.fields[index]
                            ? question.fields[index].value
                            : ""
                        )}
                      </FieldContainer>
                    ))}
              </CardContent>
            </CardWrapper>
          ))}
      </CardGridWrapper>
      {(isGameOver || gameData.status === "completed") && (
        <GameEndModal
          gameStatus={gameData.status}
          gameData={gameData}
          participantId={participantId}
          isGameOver={isGameOver}
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

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  height: fit-content;
  width: 100%;
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
    props.$isMatched ? "0" : props.$isSelected ? "1" : "0.8"};
  pointer-events: ${(props) =>
    props.$isMatched ? "none" : "auto"}; /* 配對後禁用互動 */

  border-radius: ${(props) => props.$style.borderRadius};
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
  gameData: PropTypes.object,
  gameQuestionData: PropTypes.object,
  template: PropTypes.object,
  style: PropTypes.object,
  participantId: PropTypes.string,
};

const GameEndModal = ({ gameStatus, gameData, participantId, isGameOver }) => {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserTimeUsed, setCurrentUserTimeUsed] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameStatus === "completed" && gameData?.players.length > 0) {
      const fetchParticipants = async () => {
        try {
          const participantsData = await Promise.all(
            gameData?.players.map(async (player) => {
              const participantData = await getParticipantDoc(
                player.participantId
              );

              // 計算 timeUsed，如果玩家未完成遊戲 (gameEndedAt 為 null)，則 timeUsed 為 null
              let timeUsed = null;
              if (participantData?.gameEndedAt && gameData?.startedAt) {
                // 確保使用的都是正確的時間戳記
                const startedAtMillis = gameData.startedAt.toMillis();
                const gameEndedAtMillis =
                  participantData.gameEndedAt.toMillis();

                // 確保 endedAt 比 startedAt 晚
                if (gameEndedAtMillis >= startedAtMillis) {
                  timeUsed = gameEndedAtMillis - startedAtMillis;
                } else {
                  console.warn(
                    `玩家 ${player.username} 的結束時間早於開始時間，可能有記錄錯誤。`
                  );
                }
              }

              return {
                ...participantData,
                username: player.username,
                timeUsed: timeUsed,
              };
            })
          );

          // 排名邏輯
          participantsData.sort((a, b) => {
            // 排序已完成遊戲的玩家，timeUsed 小的排在前面
            if (a.timeUsed !== null && b.timeUsed !== null) {
              return a.timeUsed - b.timeUsed;
            }
            // 如果 a 已完成，b 未完成，a 優先
            else if (a.timeUsed !== null) {
              return -1;
            }
            // 如果 b 已完成，a 未完成，b 優先
            else if (b.timeUsed !== null) {
              return 1;
            }
            // 兩者均未完成，按 currentScore 降序排序
            else {
              return b.currentScore - a.currentScore;
            }
          });

          setRankings(participantsData);
          setIsLoading(true);
        } catch (error) {
          console.error("獲取參賽者資料失敗：", error);
        }
      };

      fetchParticipants();
    }
  }, [gameStatus, gameData?.players, gameData?.startedAt, participantId]);

  // 獲取當前玩家的 timeUsed
  useEffect(() => {
    if (isGameOver && participantId) {
      const fetchCurrentUserTime = async () => {
        try {
          const participantData = await getParticipantDoc(participantId);

          let timeUsed = null;
          if (participantData?.gameEndedAt && gameData?.startedAt) {
            // 確保使用的都是正確的時間戳記
            const startedAtMillis = gameData.startedAt.toMillis();
            const gameEndedAtMillis = participantData.gameEndedAt.toMillis();

            // 確保 endedAt 比 startedAt 晚
            if (gameEndedAtMillis >= startedAtMillis) {
              timeUsed = gameEndedAtMillis - startedAtMillis;
            } else {
              console.warn(
                `玩家 ${participantData.username} 的結束時間早於開始時間，可能有記錄錯誤。`
              );
            }
          }
          setCurrentUserTimeUsed(timeUsed);
        } catch (error) {
          console.error("獲取當前用戶資料失敗：", error);
        }
      };

      fetchCurrentUserTime();
    }
  }, [isGameOver, gameData.startedAt, participantId]);

  const formatTime = (time) => {
    const minutes = String(Math.floor(time / 60000)).padStart(2, "0"); // 分鐘
    const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, "0"); // 秒
    return `${minutes} 分 ${seconds} 秒`;
  };

  const formatTimeLimit = (timeLimitInSeconds) => {
    const minutes = Math.floor(timeLimitInSeconds / 60); // 計算分鐘
    const seconds = timeLimitInSeconds % 60; // 計算剩餘的秒數
    return `${minutes} 分 ${seconds} 秒`;
  };

  if (!gameData || !gameStatus === "completed") {
    return <div>Loading...</div>;
  }
  return (
    <ModalWrapper>
      <ModalContent>
        {gameStatus === "in-progress" && (
          <WaitingWrapper>
            <h2>遊戲完成！</h2>
            <p>
              花費時間：{currentUserTimeUsed && formatTime(currentUserTimeUsed)}
            </p>
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
                      player.currentScore
                    }, 用時: ${
                      player.timeUsed
                        ? formatTime(player.timeUsed)
                        : formatTimeLimit(gameData.timeLimit)
                    }`}
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

GameEndModal.propTypes = {
  gameStatus: PropTypes.string,
  gameData: PropTypes.object,
  participantId: PropTypes.string,
  attempts: PropTypes.number,
  isGameOver: PropTypes.bool,
};

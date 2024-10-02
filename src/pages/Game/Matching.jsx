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
          setIsLoading(true);
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
          setIsLoading(false);
        } catch (error) {
          console.error("獲取參賽者資料失敗：", error);
        }
      };

      fetchParticipants();
    }
  }, [gameStatus, gameData?.players, gameData?.startedAt, participantId]);

  useEffect(() => {
    if (isGameOver && participantId && gameData?.startedAt) {
      const fetchCurrentUserTime = async () => {
        try {
          const participantData = await getParticipantDoc(participantId);

          let timeUsed = null;
          if (participantData?.gameEndedAt && gameData.startedAt) {
            // 確保使用的都是正確的時間戳記
            const startedAtMillis = gameData.startedAt.toMillis
              ? gameData.startedAt.toMillis()
              : gameData.startedAt;
            const gameEndedAtMillis = participantData.gameEndedAt.toMillis
              ? participantData.gameEndedAt.toMillis()
              : participantData.gameEndedAt;

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
  }, [isGameOver, gameData, participantId]);

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

  return (
    <ModalWrapper>
      <ModalContent>
        {gameStatus === "in-progress" && (
          <WaitingWrapper>
            <h2>遊戲完成！</h2>
            <p>
              花費時間：
              {currentUserTimeUsed !== null
                ? formatTime(currentUserTimeUsed)
                : "加載中..."}
            </p>
            <p>等待遊戲結束中...</p>
          </WaitingWrapper>
        )}
        {gameStatus === "completed" && (
          <>
            <RankingTitle>✨排行榜✨</RankingTitle>
            {isLoading ? (
              <p>加載中...</p>
            ) : (
              <RankingList>
                {rankings.map((player, index) => (
                  <RankingItem key={index} $rank={index + 1}>
                    <RankColumn>{`第${index + 1}名`}</RankColumn>
                    <NameColumn>{player.username}</NameColumn>
                    <ScoreColumn>{`${
                      player.currentScore ? player.currentScore : 0
                    }分`}</ScoreColumn>
                    <TimeColumn>
                      {player.timeUsed
                        ? formatTime(player.timeUsed)
                        : formatTimeLimit(gameData.timeLimit)}
                    </TimeColumn>
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
  margin-top: 16px;
  list-style: none;
  padding: 0;
`;

const RankingItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
  height: 36px;
  border-radius: 8px;
  padding: 0 16px;
  background-color: ${(props) => {
    if (props.$rank === 1) {
      return "#ffd700";
    } else if (props.$rank === 2) {
      return "#c0c0c0";
    } else if (props.$rank === 3) {
      return "#cd7f32";
    } else {
      return "#92a3fd";
    }
  }};
`;

const RankColumn = styled.span`
  width: 20%;
  text-align: center;
`;

const NameColumn = styled.span`
  width: 30%;
  text-align: center;
`;

const ScoreColumn = styled.span`
  width: 20%;
  text-align: center;
`;

const TimeColumn = styled.span`
  width: 30%;
  text-align: center;
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

const TrophyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width="20"
    height="20"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
    />
  </svg>
);

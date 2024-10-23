import { serverTimestamp } from "firebase/firestore";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getParticipantDoc, updateParticipantDoc } from "../../utils/api";
import bronzedMedal from "./images/MedalBronze.png";
import goldenMedal from "./images/MedalGolden.png";
import silverMedal from "./images/MedalSilver.png";

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

    if (isCardSelected(card)) {
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
    if (isSelected) return "#4e98dd";
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
                        $currentStyle={frontField.style}
                        $currentPosition={frontField.position}
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
                        $currentStyle={backField.style}
                        $currentPosition={backField.position}
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
  left: ${(props) => props.$currentPosition.x};
  top: ${(props) => props.$currentPosition.y};
  justify-content: ${(props) => props.$currentStyle.textAlign || "center"};
  align-items: center;
  width: ${(props) =>
    props.$currentStyle.width ? props.$currentStyle.width : "auto"};
  height: ${(props) =>
    props.$currentStyle.height ? props.$currentStyle.height : "auto"};
  font-size: 14px;
  @media (min-width: 640px) {
    font-size: 16px;
  }
  @media (min-width: 1024px) {
    font-size: 18px;
  }
  font-weight: ${(props) => props.$currentStyle.fontWeight || "normal"};
  color: ${(props) => props.$currentStyle.color || "#333"};
  font-style: ${(props) => props.$currentStyle.fontStyle || "normal"};
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
  pointer-events: ${(props) => (props.$isMatched ? "none" : "auto")};
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

              let timeUsed = null;
              if (participantData?.gameEndedAt && gameData?.startedAt) {
                const startedAtMillis = gameData.startedAt.toMillis();
                const gameEndedAtMillis =
                  participantData.gameEndedAt.toMillis();
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

          participantsData.sort((a, b) => {
            if (a.timeUsed !== null && b.timeUsed !== null) {
              return a.timeUsed - b.timeUsed;
            } else if (a.timeUsed !== null) {
              return -1;
            } else if (b.timeUsed !== null) {
              return 1;
            } else {
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
            const startedAtMillis = gameData.startedAt.toMillis
              ? gameData.startedAt.toMillis()
              : gameData.startedAt;
            const gameEndedAtMillis = participantData.gameEndedAt.toMillis
              ? participantData.gameEndedAt.toMillis()
              : participantData.gameEndedAt;

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
    const minutes = String(Math.floor(time / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((time % 60000) / 1000)).padStart(2, "0");
    return `${minutes} 分 ${seconds} 秒`;
  };

  const formatTimeLimit = (timeLimitInSeconds) => {
    const minutes = Math.floor(timeLimitInSeconds / 60);
    const seconds = timeLimitInSeconds % 60;
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
            <RankingTitle>排行榜</RankingTitle>
            {isLoading ? (
              <p>加載中...</p>
            ) : (
              <RankingList>
                {rankings.map((player, index) => (
                  <RankingItem key={index} $rank={index + 1}>
                    <MedalImgContainer>
                      {index === 0 && (
                        <MedalImg src={goldenMedal} alt="Golden Medal" />
                      )}
                      {index === 1 && (
                        <SilverMedalImg src={silverMedal} alt="Silver Medal" />
                      )}
                      {index === 2 && (
                        <BronzeMedalImg src={bronzedMedal} alt="Bronze Medal" />
                      )}
                    </MedalImgContainer>
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
  z-index: 1001;
`;
const WaitingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RankingTitle = styled.h1`
  position: relative;
  margin: 0 auto 8px;
  padding: 10px 50px;
  text-align: center;
  background-color: #f6c144;
  color: #854d19;
  font-weight: bold;
  user-select: none;
  font-size: 18px;
  line-height: 18px;

  &::before,
  &::after {
    content: "";
    width: 80px;
    height: 100%;
    background-color: #d99514;
    position: absolute;
    top: 16px;
    z-index: -1;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 25% 50%);
    background-image: linear-gradient(45deg, transparent 50%, #b87b0e 50%);
    background-size: 20px 20px;
    background-repeat: no-repeat;
    background-position: bottom right;
  }

  &::before {
    left: -60px;
  }

  &::after {
    right: -60px;
    transform: scaleX(-1);
  }
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
  padding: 0 16px 0 4px;
  background-color: #efeefc;
`;

const MedalImgContainer = styled.div`
  width: 10%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MedalImg = styled.img`
  width: 100%;
  height: auto;
`;

const SilverMedalImg = styled.img`
  width: 90%;
  height: auto;
`;
const BronzeMedalImg = styled.img`
  width: 80%;
  height: auto;
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
  width: 10%;
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
  background-color: #3d5a80;
  color: white;
  font-size: 16px;
  font-family: "Noto Sans TC", sans-serif;
  cursor: pointer;

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

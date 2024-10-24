import { message } from "antd";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useUser } from "../../context/UserContext.jsx";
import {
  getCardSet,
  getCardsOfCardSet,
  getGameDoc,
  getGameQuestions,
  getStyle,
  getTemplate,
  joinCompetition,
  updateGameStatus,
} from "../../utils/api";
import { db } from "../../utils/firebaseConfig.js";
import Matching from "./Matching";
import MultipleChoices from "./MultipleChoices";

function Game() {
  const { gameId } = useParams();
  const { user, loading } = useUser();
  const [gameData, setGameData] = useState(null);
  const [gameQuestionData, setGameQuestionData] = useState(null);
  const [cardSetData, setCardSetData] = useState(null);
  const [cardsData, setCardsData] = useState(null);
  const [style, setStyle] = useState(null);
  const [template, setTemplate] = useState(null);
  const [username, setUsername] = useState("");
  const [isGameHost, setIsGameHost] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [hasJoinedGame, setHasJoinedGame] = useState(false);
  const [players, setPlayers] = useState([]);
  const [participantId, setParticipantId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const isJoining = useRef(false);

  const joinGame = useCallback(
    async (isHost = false) => {
      if (user && gameId && !hasJoinedGame && !isJoining.current) {
        try {
          isJoining.current = true;
          const participantId = await joinCompetition(
            gameId,
            user.username,
            user
          );
          setHasJoinedGame(true);
          setParticipantId(participantId);
        } catch (error) {
          console.error("加入遊戲失敗：", error);
        } finally {
          isJoining.current = false;
        }
      }
    },
    [user, gameId, hasJoinedGame]
  );

  useEffect(() => {
    const fetchGameData = async () => {
      if (!gameId || loading) return;

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

          if (user) {
            setIsGameHost(user.userId === gameData.hostUserId);

            const isPlayerInGame =
              Array.isArray(gameData.players) &&
              gameData.players.some(
                (player) => player.username === user.username
              );

            if (!isPlayerInGame && !hasJoinedGame) {
              await joinGame(user.userId === gameData.hostUserId);
            } else if (isPlayerInGame) {
              setHasJoinedGame(true);
              const existingPlayer = gameData.players.find(
                (player) => player.username === user.username
              );
              if (existingPlayer) {
                setParticipantId(existingPlayer.participantId);
              }
            }
          }

          setIsDataLoading(false);
        }
      } catch (error) {
        console.error("設置遊戲的時候發生錯誤", error);
        setIsDataLoading(false);
      }
    };

    fetchGameData();
  }, [gameId, user, loading, joinGame, hasJoinedGame]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (gameId) {
      const gameRef = doc(db, "games", gameId);
      const unsubscribe = onSnapshot(gameRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setPlayers(data.players || []);
        }
      });

      return () => unsubscribe();
    }
  }, [gameId]);

  useEffect(() => {
    if (gameId) {
      const gameRef = doc(db, "games", gameId);
      const unsubscribe = onSnapshot(gameRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setGameData(data);
          setPlayers(data.players || []);
        }
      });

      return () => unsubscribe();
    }
  }, [gameId]);

  useEffect(() => {
    if (gameId && gameData) {
      const participantsRef = collection(db, "participants");
      const participantsQuery = query(
        participantsRef,
        where("gameId", "==", gameId)
      );

      const unsubscribe = onSnapshot(participantsQuery, (querySnapshot) => {
        let participants = [];
        querySnapshot.forEach((doc) => {
          participants.push({ id: doc.id, ...doc.data() });
        });

        const allParticipantsFinished = participants.every(
          (participant) =>
            participant.gameEndedAt != null && participant.gameEndedAt > 0
        );

        const gameHasStarted = participants.some(
          (participant) => participant.gameEndedAt != null
        );

        if (
          allParticipantsFinished &&
          gameHasStarted &&
          gameData.status !== "completed"
        ) {
          updateGameStatus(gameId, "completed").catch((error) => {
            console.error("更新遊戲狀態為 completed 失敗：", error);
          });
        }

        setPlayers(participants);
      });
      return () => unsubscribe();
    }
  }, [gameId, gameData]);
  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          message.success("已複製分享連結！");
        })
        .catch((err) => {
          console.error("複製分享連結失敗：", err);
          message.error("複製分享連結失敗，請稍後再試！");
        });
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleJoinGame = async () => {
    if (!username.trim()) {
      message.warning("請輸入用戶名來加入遊戲！");
      return;
    }

    try {
      const participantId = await joinCompetition(gameId, username, user);
      setHasJoinedGame(true);
      setParticipantId(participantId);
      message.success(`玩家 "${username}" 已成功加入遊戲！`);
    } catch (error) {
      console.error("加入遊戲失敗：", error);
      message.error("加入遊戲失敗，請稍後再試！");
    }
  };

  const handleStartGame = async () => {
    if (gameId && isGameHost && gameData.status === "waiting") {
      try {
        await updateGameStatus(gameId, "in-progress");
        startGameTimer();
      } catch (error) {
        console.error("無法開始遊戲：", error);
      }
    } else {
      message.warning("只有房主才能開始遊戲，且遊戲必須處於等待狀態");
    }
  };

  const startGameTimer = () => {
    const { timeLimit } = gameData;
    let remainingTime = timeLimit;

    const intervalId = setInterval(async () => {
      if (remainingTime <= 0) {
        clearInterval(intervalId);

        try {
          await updateGameStatus(gameId, "completed");
        } catch (error) {
          console.error("無法更新遊戲狀態為完成：", error);
        }
      } else {
        remainingTime -= 1;
      }
    }, 1000);
  };

  const formatTimeLimit = (timeLimitInSeconds) => {
    const minutes = Math.floor(timeLimitInSeconds / 60);
    const seconds = timeLimitInSeconds % 60;
    return `${minutes} 分 ${seconds} 秒`;
  };

  useEffect(() => {
    if (gameData && gameData.startedAt && !hasJoinedGame) {
      message.warning("遊戲已開始，無法加入！");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  }, [gameData, hasJoinedGame, navigate]);

  if (
    !gameId ||
    !gameData ||
    !gameQuestionData ||
    !cardSetData ||
    !cardsData ||
    !template ||
    !style ||
    isDataLoading ||
    loading
  ) {
    return <div>Loading...</div>;
  }
  return (
    <Wrapper>
      {contextHolder}
      <QuizDescription>
        <Lable>遊戲房</Lable>
        <Title>{gameData.roomName ? gameData.roomName : "無名稱"}</Title>
        <Lable>遊戲類型</Lable>
        <QuizTypeDescription>
          {gameData.quizType === "matching" ? "配對遊戲" : "選擇題遊戲"}
        </QuizTypeDescription>
        <Lable>時間限制</Lable>
        <QuizTypeDescription>
          {formatTimeLimit(gameData.timeLimit)}
        </QuizTypeDescription>
      </QuizDescription>
      {gameData.status === "waiting" && (
        <ShareContainer>
          <QRCodeSVG value={window.location.href} size={128} />
          <ShareButton onClick={handleShareClick}>複製遊戲連結</ShareButton>
        </ShareContainer>
      )}
      {gameData.status === "waiting" && (
        <PlayersList>
          <Lable>目前玩家</Lable>
          <PlayersGridContainer>
            {players
              .slice()
              .sort((a, b) => Date.parse(a.joinedAt) - Date.parse(b.joinedAt))
              .map((player, index) => (
                <PlayerItem key={index}>
                  <ProfilePicture src={player.profilePicture} />
                  <PlayerName>{player.username}</PlayerName>
                </PlayerItem>
              ))}
          </PlayersGridContainer>
        </PlayersList>
      )}
      {!user && !hasJoinedGame && gameData.status === "waiting" && (
        <JoinGameContainer>
          <JoinGameForm
            onSubmit={(event) => {
              event.preventDefault();
              handleJoinGame();
            }}
          >
            <UsernameInput
              type="text"
              placeholder="輸入用戶名加入遊戲"
              maxLength={10}
              value={username}
              onChange={handleUsernameChange}
            />
            <JoinButton type="submit">加入遊戲</JoinButton>
          </JoinGameForm>
        </JoinGameContainer>
      )}
      {gameData &&
        gameData.quizType === "matching" &&
        gameData.status !== "waiting" && (
          <Matching
            gameData={gameData}
            gameQuestionData={gameQuestionData}
            participantId={participantId}
            template={template}
            style={style}
          />
        )}
      {gameData &&
        gameData.quizType === "multipleChoices" &&
        gameData.status !== "waiting" && (
          <MultipleChoices
            gameData={gameData}
            gameQuestionData={gameQuestionData}
            participantId={participantId}
            template={template}
            style={style}
          />
        )}
      {isGameHost && gameData.status === "waiting" && (
        <StartGameButton onClick={handleStartGame}>開始遊戲⚡</StartGameButton>
      )}
    </Wrapper>
  );
}

export default Game;

const Wrapper = styled.div`
  margin: 80px auto 60px auto;
  padding: 10px 30px 40px 30px;
  max-width: 960px;
  border-radius: 16px;
  background: linear-gradient(to bottom right, #f5f7fa, #cdddf3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 100px);
`;

const QuizDescription = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80%;
  margin: 40px auto 10px auto;
  padding: 20px;
  border-radius: 12px;
  user-select: none;
`;

const Lable = styled.p`
  font-size: 14px;
  color: #555;
`;

const Title = styled.h2`
  margin: 14px 0;
  padding: 12px;
  font-size: 28px;
  text-align: center;
  color: #313131;
`;

const QuizTypeDescription = styled.p`
  font-size: 22px;
  color: #313131;
  margin: 10px 0;
`;

const ShareContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0 30px 0;
`;

const ShareButton = styled.button`
  padding: 10px 24px;
  background-color: #ff8a5b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  font-size: 16px;
  transition: all 0.3s;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  font-weight: 500;
  &:hover {
    background-color: #ff7043;
  }
`;

const JoinGameContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  @media screen and (max-width: 430px) {
    flex-direction: column;
  }
`;

const JoinGameForm = styled.form`
  display: flex;
  @media screen and (max-width: 430px) {
    flex-direction: column;
    align-items: center;
  }
`;

const UsernameInput = styled.input`
  padding: 12px;
  margin-right: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;

  &:focus {
    border-color: #adbce5;
    box-shadow: 0 4px 10px rgba(173, 188, 229, 0.3);
  }
  @media screen and (max-width: 430px) {
    margin-right: 0px;
  }
`;

const JoinButton = styled.button`
  padding: 8px 24px;
  background-color: #62b6cb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  font-weight: 500;

  &:hover {
    background-color: #5a9cb1;
    box-shadow: 0 4px 15px rgba(90, 156, 177, 0.3);
  }
  @media screen and (max-width: 430px) {
    margin-top: 12px;
  }
`;

const PlayersList = styled.div`
  margin-top: 40px;
  text-align: center;
  width: 80%;
  margin: 0 auto;
`;

const PlayersGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin: 10px auto;
  width: 80%;

  @media only screen and (max-width: 639px) {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
`;
const PlayerItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
`;

const ProfilePicture = styled.img`
  width: 76px;
  height: 76px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d3d3d3;
`;

const PlayerName = styled.p`
  margin-top: 10px;
  font-size: 16px;
  text-align: center;
  font-weight: 500;
  color: #3d5a80;
`;

const StartGameButton = styled.button`
  padding: 12px 22px 12px 32px;
  background-color: #36a2eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  margin: 30px auto;
  transition: all 0.3s;
  font-family: "TaiwanPearl-Regular", "Noto Sans TC", sans-serif;
  font-weight: 500;

  &:hover {
    background-color: #2b8ac6;
  }
`;

import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  getGameDoc,
  getGameQuestions,
  getCardSet,
  getCardsOfCardSet,
  getTemplate,
  getStyle,
  joinCompetition,
  updateGameStatus,
} from "../../utils/api";
import { useUser } from "../../context/UserContext.jsx";
import { QRCodeSVG } from "qrcode.react";
import { doc, collection, onSnapshot, query, where } from "firebase/firestore";
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
  const [isDataLoading, setIsDataLoading] = useState(true); //Game資料是否還在Loading
  const [hasJoinedGame, setHasJoinedGame] = useState(false);
  const [players, setPlayers] = useState([]); // 即時保存所有玩家資料
  const [participantId, setParticipantId] = useState(null); //目前玩家participantId

  const isJoining = useRef(false);

  const joinGame = useCallback(
    async (isHost = false) => {
      if (user && gameId && !hasJoinedGame && !isJoining.current) {
        try {
          isJoining.current = true;
          console.log("嘗試加入遊戲...");
          const participantId = await joinCompetition(gameId, user.username);
          setHasJoinedGame(true);
          setParticipantId(participantId);
          console.log(
            `${isHost ? "房主" : "玩家"} "${user.username}" ${
              isHost ? "自動" : ""
            }加入遊戲，ID：${participantId}！`
          );
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
        console.log("開始獲取遊戲數據...");
        const gameData = await getGameDoc(gameId);
        if (gameData) {
          setGameData(gameData);
          console.log("成功獲取遊戲數據:", gameData);

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
            console.log("檢查用戶是否已在遊戲中...");

            // 檢查玩家是否已經在遊戲中
            const isPlayerInGame =
              Array.isArray(gameData.players) &&
              gameData.players.some(
                (player) => player.username === user.username
              );

            if (!isPlayerInGame && !hasJoinedGame) {
              console.log("用戶不在遊戲中，嘗試加入...");
              await joinGame(user.userId === gameData.hostUserId);
            } else if (isPlayerInGame) {
              console.log("用戶已在遊戲中");
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
  // 監聽遊戲中的玩家列表變化
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

          // 當遊戲狀態變更為 "completed" 時，通知玩家遊戲結束
          if (data.status === "completed") {
            console.log("遊戲時間結束！");
          }
        }
      });

      // 在組件卸載時取消監聽
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

        if (participants.length === 0) {
          console.log("沒有參與者，等待玩家加入");
          return;
        }

        const allParticipantsFinished = participants.every(
          (participant) =>
            participant.timeUsed != null && participant.timeUsed > 0
        );

        const gameHasStarted = participants.some(
          (participant) => participant.timeUsed != null
        );

        if (
          allParticipantsFinished &&
          gameHasStarted &&
          gameData.status !== "completed"
        ) {
          updateGameStatus(gameId, "completed")
            .then(() => {
              console.log("所有玩家已完成遊戲，遊戲狀態已更新為 completed");
            })
            .catch((error) => {
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
        .then(() => alert("已複製分享連結！"))
        .catch((err) => console.error("複製分享連結失敗：", err));
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleJoinGame = async () => {
    if (!username.trim()) {
      alert("請輸入用戶名來加入遊戲！");
      return;
    }

    try {
      const participantId = await joinCompetition(gameId, username);
      setHasJoinedGame(true);
      setParticipantId(participantId);
      console.log(`玩家 "${username}" 加入遊戲，ID：${participantId}！`);
    } catch (error) {
      console.error("加入遊戲失敗：", error);
    }
  };

  const handleStartGame = async () => {
    if (gameId && isGameHost && gameData.status === "waiting") {
      try {
        await updateGameStatus(gameId, "in-progress");
        console.log("遊戲已開始！");
        // 開始計時器
        startGameTimer();
      } catch (error) {
        console.error("無法開始遊戲：", error);
      }
    } else {
      alert("只有房主才能開始遊戲，並且遊戲必須處於等待狀態");
    }
  };

  // 啟動遊戲計時器
  const startGameTimer = () => {
    const { timeLimit } = gameData; // timeLimit 是以秒為單位
    let remainingTime = timeLimit;

    const intervalId = setInterval(async () => {
      if (remainingTime <= 0) {
        clearInterval(intervalId);
        console.log("遊戲時間到，遊戲結束！");

        // 更新遊戲狀態為「completed」
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
    const minutes = Math.floor(timeLimitInSeconds / 60); // 計算分鐘
    const seconds = timeLimitInSeconds % 60; // 計算剩餘的秒數
    return `${minutes} 分 ${seconds} 秒`;
  };

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
      <QuizDescription>
        <Title>
          遊戲房：{gameData.roomName ? gameData.roomName : "無名稱"}
        </Title>
        <QuizTypeDescription>
          {gameData.quizType === "matching" ? "配對小遊戲" : "選擇題小遊戲"}
        </QuizTypeDescription>
        <QuizTypeDescription>
          時間限制：{formatTimeLimit(gameData.timeLimit)}
        </QuizTypeDescription>
      </QuizDescription>
      {/* 分享按鈕和 QR 碼 */}
      {gameData.status === "waiting" && (
        <ShareContainer>
          <ShareButton onClick={handleShareClick}>複製遊戲連結</ShareButton>
          <QRCodeSVG value={window.location.href} size={128} />
        </ShareContainer>
      )}

      {/* 未登入用戶名輸入框 */}
      {!user && !hasJoinedGame && gameData.status === "waiting" && (
        <JoinGameContainer>
          <UsernameInput
            type="text"
            placeholder="輸入用戶名加入遊戲"
            value={username}
            onChange={handleUsernameChange}
          />
          <JoinButton onClick={handleJoinGame}>加入遊戲</JoinButton>
        </JoinGameContainer>
      )}
      {/* 顯示目前的玩家列表 */}
      {gameData.status === "waiting" && (
        <PlayersList>
          <PlayersTitle>目前玩家：</PlayersTitle>
          {players.map((player, index) => (
            <PlayerItem key={index}>{player.username}</PlayerItem>
          ))}
        </PlayersList>
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
        <StartGameButton onClick={handleStartGame}>開始遊戲</StartGameButton>
      )}
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
  display: flex;
  flex-direction: column;
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

const ShareContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
`;

const ShareButton = styled.button`
  padding: 10px 20px;
  background-color: #f59873;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
  font-size: 14px;

  &:hover {
    background-color: #f89f7c;
  }
`;

const JoinGameContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const UsernameInput = styled.input`
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const JoinButton = styled.button`
  padding: 10px 20px;
  background-color: #adbce5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #215688;
  }
`;

const PlayersList = styled.div`
  margin-top: 30px;
  text-align: center;
`;

const PlayersTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 10px;
`;

const PlayerItem = styled.div`
  font-size: 16px;
  margin-bottom: 5px;
`;

const StartGameButton = styled.button`
  padding: 10px 20px;
  background-color: #adbce5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #215688;
  }
  margin: 0 auto;
`;

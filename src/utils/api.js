import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "./firebaseConfig";

export async function getUserDocument(userId) {
  if (!userId) {
    console.error("用戶 ID 無效");
    return null; // 檢查 userId 是否有效
  }

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("讀取會員資料失敗：", error);
    return null;
  }
}

export async function saveCardStyle(data) {
  try {
    const docRef = await addDoc(collection(db, "cardStyles"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "cardStyles", docRef.id), { styleId: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error("儲存樣式失敗 ", error);
  }
}

export async function getUserCardStyles(userId) {
  if (!userId) return null;
  try {
    const cardStylesRef = collection(db, "cardStyles");
    const q = query(cardStylesRef, where("userId", "in", [userId, "default"]));
    const querySnapshot = await getDocs(q);
    const cardStyles = querySnapshot.docs.map((doc) => doc.data());
    return cardStyles;
  } catch (error) {
    console.error("獲取卡片樣式資料失敗：", error);
    return null;
  }
}

export async function addNewLabel(labelData) {
  const labelsCollectionRef = collection(db, "labels");
  try {
    // 先生成一個新的 document ID
    const newLabelRef = doc(labelsCollectionRef);
    const labelId = newLabelRef.id; // 獲取新生成的 document ID
    await setDoc(newLabelRef, { ...labelData, labelId });
    return labelId;
  } catch (error) {
    console.error("無法新增標籤：", error);
  }
}

export async function getUserLabels(userId) {
  const labels = [];
  const labelsCollectionRef = collection(db, "labels");
  try {
    const q = query(labelsCollectionRef, where("createdBy", "==", userId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      labels.push(doc.data());
    });
    return labels;
  } catch (error) {
    console.error("獲取用戶標籤失敗：", error);
    return [];
  }
}

export async function getLabelsOfCardSet(cardSetId) {
  try {
    // 取得指定牌組的文件
    const cardSetRef = doc(db, "cardSets", cardSetId);
    const cardSetSnapshot = await getDoc(cardSetRef);

    if (!cardSetSnapshot.exists()) {
      throw new Error(`Card set with id ${cardSetId} does not exist`);
    }

    // 取得 labels 陣列
    const { labels } = cardSetSnapshot.data();
    if (!labels || labels.length === 0) {
      return []; // 如果沒有標籤，回傳空陣列
    }

    // Firestore 的 `in` 查詢最多支持 10 個項目，我們檢查是否超過
    if (labels.length > 10) {
      throw new Error("Too many labels, Firestore in query supports only 10.");
    }

    // 使用 labels 陣列中的 labelId 查詢 labels 集合
    const labelsCollectionRef = collection(db, "labels");
    const q = query(labelsCollectionRef, where("labelId", "in", labels));

    const querySnapshot = await getDocs(q);

    // 取得每個 label 的資料
    const labelData = [];
    querySnapshot.forEach((doc) => {
      labelData.push(doc.data());
    });

    // 確認是否所有的 `labelId` 都有對應的資料
    if (labelData.length !== labels.length) {
      console.warn(
        `Some labels not found in the labels collection. Expected: ${labels.length}, found: ${labelData.length}`
      );
    }

    return labelData; // 回傳標籤資料陣列
  } catch (error) {
    console.error("Error fetching labels of card set:", error);
    return [];
  }
}
export async function getUserCardTemplates(userId) {
  const cardFields = [];
  const cardFieldsRef = collection(db, "cardFields");

  try {
    // 查詢指定 userId 的模板（包括預設的 userId: "default"）
    const q = query(cardFieldsRef, where("userId", "in", [userId, "default"]));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      cardFields.push(doc.data());
    });

    return cardFields;
  } catch (error) {
    console.error("獲取卡片模板失敗：", error);
    return [];
  }
}

export async function saveCardTemplate(data) {
  try {
    const docRef = await addDoc(collection(db, "cardFields"), {
      ...data,
      createdAt: serverTimestamp(),
    });

    await updateDoc(docRef, {
      fieldTemplateId: docRef.id,
    });
    return docRef.id;
  } catch (error) {
    console.error("儲存樣式失敗：", error.message);
  }
}

export async function uploadImageToStorage(file) {
  const storageRef = ref(storage, `images/${file.name}-${Date.now()}`);
  try {
    // 將圖片上傳至 Firebase Storage
    const snapshot = await uploadBytes(storageRef, file);
    // 獲取上傳圖片的下載 URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    // 返回下載 URL
    return downloadURL;
  } catch (error) {
    console.error("圖片上傳失敗:", error);
    throw new Error("圖片上傳失敗");
  }
}

export async function saveCardSet(data) {
  try {
    const docRef = await addDoc(collection(db, "cardSets"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "cardSets", docRef.id), { cardSetId: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error("儲存牌組失敗 ", error);
    return null;
  }
}

export async function updateCardSetCardOrder(cardSetId, orderArray) {
  try {
    await updateDoc(doc(db, "cardSets", cardSetId), { cardOrder: orderArray });
    return true; // 返回 true 表示成功
  } catch (error) {
    console.error("更新卡牌順序失敗：", error);
    return null; // 返回 null 表示失敗
  }
}

export async function saveCard(data, cardSetId) {
  try {
    const docRef = await addDoc(collection(db, "cards"), {
      ...data,
      createdAt: serverTimestamp(),
      cardSetId: cardSetId,
    });
    await updateDoc(doc(db, "cards", docRef.id), { cardId: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error("儲存牌組失敗 ", error);
    return null;
  }
}
export async function uploadCardSetWithCards(cardSetData, cardContent, userId) {
  if (!userId) {
    throw new Error("儲存卡片失敗：無效的用戶");
  }
  try {
    // 1. 儲存卡牌組資料並獲得 cardSetId
    const cardSetId = await saveCardSet(cardSetData);
    if (!cardSetId) {
      throw new Error("卡牌組儲存失敗");
    }

    // 2. 逐張卡片儲存，並獲取每張卡片的 cardId
    const cardIds = [];
    for (const card of cardContent) {
      const cardData = {
        userId: userId,
        frontFields: card.frontFields,
        backFields: card.backFields,
      };
      const cardId = await saveCard(cardData, cardSetId); // 儲存每張卡片
      if (!cardId) {
        throw new Error("卡片儲存失敗");
      }
      cardIds.push(cardId); // 儲存卡片ID到陣列中
    }

    // 3. 更新卡牌組的 cardOrder 來保存卡牌順序
    const updateResult = await updateCardSetCardOrder(cardSetId, cardIds);
    if (!updateResult) {
      throw new Error("更新卡牌組順序失敗");
    }
    return cardSetId;
  } catch (error) {
    console.error("上傳卡牌組和卡片失敗：", error.message);
    return null;
  }
}

export async function getCardSet(cardSetId) {
  if (!cardSetId) return null;
  try {
    const cardSetRef = doc(db, "cardSets", cardSetId);
    const cardSetSnap = await getDoc(cardSetRef);
    const cardSetData = cardSetSnap.data();
    return cardSetData;
  } catch (error) {
    console.error("獲取卡牌組資料資料失敗：", error);
    return null;
  }
}

export async function getStyle(styleId) {
  if (!styleId) return null;
  try {
    const cardStyleRef = doc(db, "cardStyles", styleId);
    const cardStyleSnap = await getDoc(cardStyleRef);
    const cardStyleData = cardStyleSnap.data();
    return cardStyleData;
  } catch (error) {
    console.error("獲取卡牌組資料資料失敗：", error);
    return null;
  }
}

export async function getTemplate(fieldTemplateId) {
  if (!fieldTemplateId) return null;
  try {
    const cardTemplateRef = doc(db, "cardFields", fieldTemplateId);
    const cardTemplateSnap = await getDoc(cardTemplateRef);
    const cardTemplateData = cardTemplateSnap.data();
    return cardTemplateData;
  } catch (error) {
    console.error("獲取模板資料失敗：", error);
    return null;
  }
}

export async function getCardsOfCardSet(cardSetId) {
  if (!cardSetId) return null;
  try {
    const cardsRef = collection(db, "cards");
    const q = query(cardsRef, where("cardSetId", "==", cardSetId));
    const querySnapshot = await getDocs(q);
    const cards = querySnapshot.docs.map((doc) => doc.data());
    return cards;
  } catch (error) {
    console.error("獲取卡牌組卡牌失敗：", error);
  }
}

export async function getUserAllCardSets(userId) {
  if (!userId) {
    console.error("無效的用戶ID");
    return null;
  }

  const cardSetsRef = collection(db, "cardSets");
  try {
    const q = query(cardSetsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const cardSets = querySnapshot.docs.map((doc) => doc.data());
    return cardSets;
  } catch (error) {
    console.error("獲取用戶所有卡牌組失敗：", error);
    return null;
  }
}

export async function createQuiz(data) {
  if (
    !data ||
    typeof data !== "object" ||
    !data.userId ||
    !data.cardSetId ||
    !data.quizType
  ) {
    console.error("無效的測驗資料！請確保 userId, cardSetId, quizType 存在。");
    return null;
  }
  const quizzesRef = collection(db, "quizzes");
  try {
    const docRef = await addDoc(quizzesRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "quizzes", docRef.id), { quizId: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error("創建測驗失敗：", error);
    return null;
  }
}

export async function getQuiz(quizId) {
  if (!quizId) {
    console.error("無效的測驗資料！請確保 quizId 存在。");
    return null;
  }
  try {
    const quizRef = doc(db, "quizzes", quizId);
    const quizSnap = await getDoc(quizRef);
    const quizData = quizSnap.data();
    return quizData;
  } catch (error) {
    console.error("獲取測驗資料失敗：", error);
    return null;
  }
}

export async function updateQuiz(quizId, newQuizData) {
  if (!quizId) {
    console.error("無效的測驗資料！請確保 quizId 存在。");
    return null;
  }
  try {
    const quizRef = doc(db, "quizzes", quizId);
    await updateDoc(quizRef, {
      ...newQuizData,
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("更新測驗資料失敗：", error);
    return null;
  }
}

export async function register(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: username,
      createdAt: serverTimestamp(),
      activeDays: [Timestamp.now()],
      userId: user.uid,
      profilePicture:
        "https://firebasestorage.googleapis.com/v0/b/becca-24.appspot.com/o/photo-placeholder.jpg?alt=media&token=6f95796c-a80d-4028-ab85-c284d3276a4a",
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    throw error;
  }
}

export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
}

export async function updateActiveDays(userId) {
  const userRef = doc(db, "users", userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const activeDays = userData.activeDays || [];

      const lastActiveDay = activeDays[activeDays.length - 1];
      if (!lastActiveDay || !lastActiveDay.isEqual(todayTimestamp)) {
        // 如果不是今天，則添加今天的日期
        await updateDoc(userRef, {
          activeDays: arrayUnion(todayTimestamp),
        });
      }
    } else {
      console.error("用戶文檔不存在");
    }
  } catch (error) {
    console.error("更新用戶活躍日期時出錯:", error);
    throw error;
  }
}

const googleTranslateApiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateApiKey}`;

export async function translateText(text, targetLanguage) {
  const response = await fetch(translateUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      target: targetLanguage,
    }),
  });

  const data = await response.json();

  if (data.error) {
    console.error("翻譯錯誤:", data.error.message);
    return;
  }

  const translatedText = data.data.translations[0].translatedText;
  return translatedText;
}

export async function getUserCardSetCount(currentUserId) {
  const collectionRef = collection(db, "cardSets");
  const q = query(collectionRef, where("userId", "==", currentUserId));

  try {
    const snapshot = await getCountFromServer(q);

    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching card set count:", error);
    return 0;
  }
}

export async function getCompletedQuizzesCount(currentUserId) {
  const collectionRef = collection(db, "quizzes");

  const q = query(
    collectionRef,
    where("userId", "==", currentUserId),
    where("completedAt", "!=", null)
  );

  try {
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching completed quizzes count:", error);
    return 0;
  }
}

export async function updateProfilePicture(userId, file) {
  if (!file) {
    console.error("沒有選擇檔案");
    return;
  }

  const storageRef = ref(storage, `profilePictures/${userId}/${file.name}`); // 設定 Storage 路徑

  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      profilePicture: downloadURL,
    });
    return downloadURL;
  } catch (error) {
    console.error("上傳或更新大頭貼失敗：", error);
  }
}

export async function search(searchKeyword) {
  try {
    const titleQuery = query(
      collection(db, "cardSets"),
      where("title", ">=", searchKeyword),
      where("title", "<=", searchKeyword + "\uf8ff"),
      where("visibility", "==", "public")
    );

    const descriptionQuery = query(
      collection(db, "cardSets"),
      where("description", ">=", searchKeyword),
      where("description", "<=", searchKeyword + "\uf8ff"),
      where("visibility", "==", "public")
    );

    const labelsQuery = query(
      collection(db, "cardSets"),
      where("labelNames", "array-contains", searchKeyword),
      where("visibility", "==", "public")
    );

    const [titleSnapshot, descriptionSnapshot, labelsSnapshot] =
      await Promise.all([
        getDocs(titleQuery),
        getDocs(descriptionQuery),
        getDocs(labelsQuery),
      ]);

    const uniqueResults = new Map();

    titleSnapshot.forEach((doc) => {
      uniqueResults.set(doc.id, doc.data());
    });

    descriptionSnapshot.forEach((doc) => {
      uniqueResults.set(doc.id, doc.data());
    });

    labelsSnapshot.forEach((doc) => {
      uniqueResults.set(doc.id, doc.data());
    });

    const finalResults = Array.from(uniqueResults.values());

    return finalResults;
  } catch (error) {
    console.error("搜尋過程中發生錯誤：", error);
  }
}

export async function favoriteCardSet(userId, cardSetId) {
  const userDocRef = doc(db, "users", userId);

  try {
    await updateDoc(userDocRef, {
      favorites: arrayUnion(cardSetId),
    });
  } catch (error) {
    console.error("收藏卡牌組失敗：", error);
  }
}

export async function isCardSetFavorited(userId, cardSetId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const favorites = userData.favorites || [];
      return favorites.includes(cardSetId);
    } else {
      console.error("User document does not exist");
      return false;
    }
  } catch (error) {
    console.error("Failed to check if card set is favorited:", error);
    return false;
  }
}

export async function unfavoriteCardSet(userId, cardSetId) {
  try {
    const userDocRef = doc(db, "users", userId);

    // 使用 arrayRemove 從 favorites 中移除指定的 cardSetId
    await updateDoc(userDocRef, {
      favorites: arrayRemove(cardSetId), // 移除 cardSetId
    });
  } catch (error) {
    console.error("Failed to unfavorite card set:", error);
  }
}

export async function getUserCollection(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const favorites = userData.favorites || [];
      return favorites;
    } else {
      console.error("User document does not exist");
      return [];
    }
  } catch (error) {
    console.error("查找用戶收藏失敗：", error);
    return false;
  }
}

export async function updateCardSet(cardSetId, data) {
  try {
    const docRef = doc(db, "cardSets", cardSetId);
    await updateDoc(docRef, { ...data, lastEditedAt: serverTimestamp() });
  } catch (error) {
    console.error("更新牌組資料失敗", error);
  }
}

export async function updateCard(cardId, data) {
  try {
    const cardRef = doc(db, "cards", cardId);
    await updateDoc(cardRef, { ...data });
  } catch (error) {
    console.error("更新卡牌失敗", error);
  }
}

export async function updateCardSetWithNewCards(
  cardSetData,
  cardContent,
  userId,
  deletedCards
) {
  if (!userId) {
    throw new Error("儲存卡片失敗：無效的用戶");
  }

  try {
    // 1. 更新卡牌組資料
    await updateCardSet(cardSetData.cardSetId, cardSetData);

    const newCardIds = [];
    const batch = writeBatch(db); // 使用批量寫入

    // 2. 處理卡片內容（新增和更新）
    for (const card of cardContent) {
      if (card.isNew) {
        const cardData = {
          userId: userId,
          frontFields: card.frontFields,
          backFields: card.backFields,
        };
        const cardId = await saveCard(cardData, cardSetData.cardSetId); // 假設 saveCard 新增卡片
        newCardIds.push(cardId); // 將新卡片的 ID 存入
      } else {
        const cardRef = doc(db, "cards", card.cardId);
        batch.update(cardRef, card); // 使用批量更新現有卡片
      }
    }

    // 3. 更新卡牌組中的 cardOrder，加入新卡片的 ID
    const cardSetRef = doc(db, "cardSets", cardSetData.cardSetId);
    batch.update(cardSetRef, {
      cardOrder: arrayUnion(...newCardIds), // 展開 newCardIds 以將每個新卡片 ID 添加到 cardOrder
    });

    // 4. 處理刪除的卡片
    for (const deletedCardId of deletedCards) {
      const cardRef = doc(db, "cards", deletedCardId);
      batch.delete(cardRef); // 批量刪除卡片

      // 從 cardOrder 中移除刪除的卡片 ID
      batch.update(cardSetRef, {
        cardOrder: arrayRemove(deletedCardId),
      });
    }

    // 5. 提交批量操作
    await batch.commit();
  } catch (error) {
    console.error("更新卡牌組失敗：", error.message);
    return null;
  }
}

export async function deleteCardSet(cardSetId) {
  try {
    const cardSetRef = doc(db, "cardSets", cardSetId);
    await deleteDoc(cardSetRef);

    const usersQuery = query(
      collection(db, "users"),
      where("favorites", "array-contains", cardSetId)
    );
    const usersSnapshot = await getDocs(usersQuery);

    for (const userDoc of usersSnapshot.docs) {
      const userRef = doc(db, "users", userDoc.id);
      await updateDoc(userRef, {
        favorites: arrayRemove(cardSetId),
      });
    }
    const cardsQuery = query(
      collection(db, "cards"),
      where("cardSetId", "==", cardSetId)
    );
    const cardsSnapshot = await getDocs(cardsQuery);

    for (const cardDoc of cardsSnapshot.docs) {
      const cardRef = doc(db, "cards", cardDoc.id);
      await deleteDoc(cardRef);
    }
  } catch (error) {
    console.error("刪除卡牌組失敗：", error);
  }
}

export async function createGameDoc(data) {
  try {
    const gamesCollectionRef = collection(db, "games");
    const docRef = await addDoc(gamesCollectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      status: "waiting",
    });
    await updateDoc(docRef, { gameId: docRef.id });
    return docRef.id;
  } catch {
    return null;
  }
}

export async function uploadGameQuestionDoc(data) {
  try {
    const gameQuestionCollectionRef = collection(db, "gameQuestions");
    const docRef = await addDoc(gameQuestionCollectionRef, {
      ...data,
      gameQuestionId: "",
    });
    await updateDoc(docRef, { gameQuestionId: docRef.id });
    return docRef.id;
  } catch {
    return null;
  }
}

export async function createGameWithQuestion(gameData, questionData) {
  try {
    const gameId = await createGameDoc(gameData);
    if (!gameId) {
      throw new Error("創建遊戲失敗");
    }
    const gameQuestionId = await uploadGameQuestionDoc({
      ...questionData,
      gameId,
    });
    if (!gameQuestionId) {
      throw new Error("創建遊戲題目失敗");
    }

    // 將 gameQuestionId 更新到 game 文檔中
    const gameDocRef = doc(db, "games", gameId);
    await updateDoc(gameDocRef, { gameQuestionId });
    return gameId;
  } catch {
    return null;
  }
}

export async function getGameDoc(gameId) {
  try {
    const gameRef = doc(db, "games", gameId);
    const gameSnapshot = await getDoc(gameRef);
    if (gameSnapshot.exists()) {
      const gameData = gameSnapshot.data();
      return gameData;
    } else {
      throw new Error("找不到遊戲資料");
    }
  } catch {
    return null;
  }
}

export async function getGameQuestions(gameQuestionId) {
  try {
    const gameQuestionRef = doc(db, "gameQuestions", gameQuestionId);
    const gameQuestionSnapshot = await getDoc(gameQuestionRef);
    if (gameQuestionSnapshot.exists()) {
      const gameQuestionData = gameQuestionSnapshot.data();
      return gameQuestionData;
    } else {
      throw new Error("找不到遊戲問題");
    }
  } catch {
    return null;
  }
}

export async function joinCompetition(gameId, username, user) {
  try {
    let participantId = "";
    const publicAvatars = [
      "https://firebasestorage.googleapis.com/v0/b/becca-24.appspot.com/o/beccaDogs%2Fbecca1.png?alt=media&token=0fd51cb4-ad4f-4fbe-bd61-7bd45f886ee7",
      "https://firebasestorage.googleapis.com/v0/b/becca-24.appspot.com/o/beccaDogs%2Fbecca2.png?alt=media&token=dedb5821-7be7-4875-b5d9-92e261c6bb13",
      "https://firebasestorage.googleapis.com/v0/b/becca-24.appspot.com/o/beccaDogs%2Fbecca3.png?alt=media&token=8221eb3f-5d13-4315-9963-3560332ce51f",
    ];
    // 選擇一個隨機頭像
    const randomAvatar =
      publicAvatars[Math.floor(Math.random() * publicAvatars.length)];

    const participantAvatar = user ? user.profilePicture : randomAvatar;

    await runTransaction(db, async (transaction) => {
      // 創建參賽者文檔
      const participantsCollectionRef = collection(db, "participants");
      const participantData = {
        participantId: "",
        gameId,
        username,
        profilePicture: participantAvatar,
        gameEndedAt: null,
        joinedAt: new Date().toISOString(),
      };
      const docRef = await addDoc(participantsCollectionRef, participantData);

      // 獲取參賽者 ID
      participantId = docRef.id;

      // 更新 participantId
      transaction.update(docRef, { participantId });

      // 更新遊戲的 players 列表
      const gameRef = doc(db, "games", gameId);
      transaction.update(gameRef, {
        players: arrayUnion({
          participantId,
          username,
          profilePicture: participantAvatar,
          joinedAt: new Date().toISOString(),
        }),
      });
    });
    return participantId; // 返回 participantId
  } catch (error) {
    console.error("加入競賽失敗：", error);
    return null; // 返回 null 表示失敗
  }
}

export async function updateGameStatus(gameId, status) {
  try {
    const gameRef = doc(db, "games", gameId);
    if (status === "in-progress") {
      await updateDoc(gameRef, { status, startedAt: serverTimestamp() });
    } else if (status === "completed") {
      await updateDoc(gameRef, { status, endeddAt: serverTimestamp() });
    }
  } catch (error) {
    console.error("更新遊戲狀態失敗：", error);
  }
}

export async function updateParticipantDoc(participantId, data) {
  try {
    const participantDocRef = doc(db, "participants", participantId);
    await updateDoc(participantDocRef, data);
  } catch (error) {
    console.error("更新玩家成績失敗：", error);
  }
}

export async function getParticipantDoc(participantId) {
  try {
    const participantDocRef = doc(db, "participants", participantId);
    const participantDocSnapshot = await getDoc(participantDocRef);

    if (participantDocSnapshot.exists()) {
      return participantDocSnapshot.data();
    } else {
      console.error("找不到參賽者文檔");
      return null;
    }
  } catch (error) {
    console.error("獲取玩家資料失敗：", error);
    return null;
  }
}

export const updateUsername = async (userId, newUsername) => {
  const userDoc = doc(db, "users", userId);
  try {
    await updateDoc(userDoc, {
      username: newUsername,
    });
  } catch (error) {
    console.error("更新用戶名稱失敗：", error);
  }
};

export const signInWithGoogle = async (onClose, setUser) => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);

    // 獲取 Google 登入的使用者資訊
    const user = result.user;

    // 檢查 Firestore 中是否已經有該用戶的資料
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // 如果沒有該用戶的資料，則創建新文檔
      await setDoc(userDocRef, {
        email: user.email,
        username: user.displayName || "Unknown", // Google 登入可能會有顯示名稱
        createdAt: serverTimestamp(),
        activeDays: [Timestamp.now()],
        userId: user.uid,
        profilePicture:
          user.photoURL ||
          "https://firebasestorage.googleapis.com/v0/b/becca-24.appspot.com/o/photo-placeholder.jpg?alt=media&token=6f95796c-a80d-4028-ab85-c284d3276a4a", // 預設圖片
      });
      // 手動更新 user 狀態
      setUser({
        email: user.email,
        username: user.displayName,
        profilePicture: user.photoURL,
        userId: user.uid,
        activeDays: [Timestamp.now()],
      });
    }
    // 成功登入後，關閉 modal
    onClose();
  } catch (error) {
    console.error("Google 登入失敗：", error.message);
    throw error;
  }
};

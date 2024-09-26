import { db, storage, auth } from "./firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  getDoc,
  query,
  where,
  getDocs,
  setDoc,
  Timestamp,
  getCountFromServer,
  arrayRemove,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

export async function getUserDocument(userId) {
  if (!userId) {
    console.error("用戶 ID 無效");
    return null; // 檢查 userId 是否有效
  }

  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("成功讀取會員資料：", docRef.id);
      return docSnap.data();
    } else {
      console.log("沒有找到該會員資料");
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
    console.log("成功儲存新樣式：", docRef.id);
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
    console.log("成功獲取卡片樣式資料：", cardStyles);
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

    console.log("成功儲存標籤：", labelId);
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
    console.log("成功獲取用戶標籤：", labels);
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

    console.log("成功儲存新模板並寫入 fieldTemplateId：", docRef.id);
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

    console.log("圖片已上傳", snapshot);

    // 獲取上傳圖片的下載 URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("圖片下載 URL:", downloadURL);

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
    console.log("成功儲存牌組：", docRef.id);
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
    console.log("卡牌順序更新成功");
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
    console.log("成功儲存卡片：", docRef.id);
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

    console.log("卡牌組和卡片儲存成功，卡牌組ID：", cardSetId);
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
    console.log("成功獲取卡牌組資料：", cardSetData);
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
    console.log("成功獲取卡牌組資料：", cardStyleData);
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
    console.log("成功獲取模板：", cardTemplateData);
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
    console.log("成功獲取卡牌組卡牌:", cards);
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
    console.log("成功獲得用戶所有卡牌組：", cardSets);
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
    console.log("測驗成功創建，ID: ", docRef.id);
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
    console.log("成功獲取測驗資料：", quizData);
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
    console.log("更新測驗資料成功！");
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
    console.log("User registered and data stored in Firestore:", user);
  } catch (error) {
    console.error("Error registering user:", error.message);
    throw error;
  }
}

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User logged in:", user);
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
        console.log("用戶活躍日期已更新");
      } else {
        console.log("用戶今天已經被標記為活躍");
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
  console.log(`翻譯結果: ${translatedText}`);
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
    console.log("檔案上傳成功");

    const downloadURL = await getDownloadURL(storageRef);
    console.log("圖片下載 URL：", downloadURL);

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      profilePicture: downloadURL,
    });

    console.log("用戶大頭貼已更新");
    return downloadURL;
  } catch (error) {
    console.error("上傳或更新大頭貼失敗：", error);
  }
}

export async function search(searchKeyword) {
  try {
    // title 查詢，加上 visibility 為 public 的條件
    const titleQuery = query(
      collection(db, "cardSets"),
      where("title", ">=", searchKeyword),
      where("title", "<=", searchKeyword + "\uf8ff"),
      where("visibility", "==", "public") // 加入 visibility 過濾條件
    );

    // description 查詢，加上 visibility 為 public 的條件
    const descriptionQuery = query(
      collection(db, "cardSets"),
      where("description", ">=", searchKeyword),
      where("description", "<=", searchKeyword + "\uf8ff"),
      where("visibility", "==", "public") // 加入 visibility 過濾條件
    );

    // labelNames 查詢，加上 visibility 為 public 的條件
    const labelsQuery = query(
      collection(db, "cardSets"),
      where("labelNames", "array-contains", searchKeyword),
      where("visibility", "==", "public") // 加入 visibility 過濾條件
    );

    // 執行所有查詢
    const [titleSnapshot, descriptionSnapshot, labelsSnapshot] =
      await Promise.all([
        getDocs(titleQuery),
        getDocs(descriptionQuery),
        getDocs(labelsQuery),
      ]);

    const combinedResults = new Set();

    titleSnapshot.forEach((doc) => combinedResults.add(doc.data()));
    descriptionSnapshot.forEach((doc) => combinedResults.add(doc.data()));
    labelsSnapshot.forEach((doc) => combinedResults.add(doc.data()));

    // 將結果轉換成陣列
    const finalResults = Array.from(combinedResults);

    console.log(finalResults);
    return finalResults; // 返回搜尋結果
  } catch (error) {
    console.error("搜尋過程中發生錯誤：", error);
  }
}

export async function favoriteCardSet(userId, cardSetId) {
  const userDocRef = doc(db, "users", userId);

  try {
    // 使用 arrayUnion 將 cardSetId 加入 favorites 陣列中
    await updateDoc(userDocRef, {
      favorites: arrayUnion(cardSetId), // 僅儲存 cardSetId
    });
    console.log(`成功收藏卡牌組：${cardSetId}`);
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
      const favorites = userData.favorites || []; // 確保 favorites 陣列存在
      return favorites.includes(cardSetId); // 使用 includes 判斷是否已收藏
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

    console.log(`Card set ${cardSetId} has been unfavorited by user ${userId}`);
  } catch (error) {
    console.error("Failed to unfavorite card set:", error);
  }
}

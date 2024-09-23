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
    const q = query(cardStylesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const cardStyles = querySnapshot.docs.map((doc) => doc.data());
    console.log("成功獲取卡片樣式資料：", cardStyles);
    return cardStyles;
  } catch (error) {
    console.error("獲取卡片樣式資料失敗：", error);
    return null;
  }
}

export async function addNewLabel(newLabel, userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      labels: arrayUnion(newLabel),
    });
    console.log("標籤已成功更新至資料庫");
  } catch (error) {
    console.error("無法更新標籤：", error);
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

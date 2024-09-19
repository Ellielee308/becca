import { db, storage } from "./firebaseConfig";
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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function getUserDocument(userId) {
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

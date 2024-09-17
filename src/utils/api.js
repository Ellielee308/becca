import { db } from "./firebaseConfig";
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
    console.log("成功寫入StyleID：", docRef.id);
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

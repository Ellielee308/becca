import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default async function saveCardStyle(data) {
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

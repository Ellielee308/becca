import { createContext, useState, useContext, useEffect } from "react";
import { getUserDocument } from "../utils/api";
import { onAuthStateChanged } from "firebase/auth"; // 引入 Firebase 的監聽函數
import { auth } from "../utils/firebaseConfig";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userData = await getUserDocument(currentUser.uid);
          console.log("獲取已登入用戶資料：", userData);
          setUser(userData);
        } catch (error) {
          console.error("獲取用戶資料失敗：", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

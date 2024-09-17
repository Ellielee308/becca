import { createContext, useState, useContext, useEffect } from "react";
import { getUserDocument } from "../utils/api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // 用戶資料狀態

  const updateUser = async (userId) => {
    try {
      const userData = await getUserDocument(userId);
      console.log("獲取的用戶資料：", userData);
      setUser(userData);
    } catch (error) {
      console.error("獲取用戶資料失敗：", error);
    }
  };

  // 使用測試用的會員 ID 進行初始化
  useEffect(() => {
    const testUserId = "MRvw8pLirv7B0y4zZlnB"; // 測試用會員 ID
    updateUser(testUserId); // 初始化時獲取用戶資料
  }, []);

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

import { onAuthStateChanged } from "firebase/auth";
import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useState } from "react";
import { getUserDocument, updateActiveDays } from "../utils/api";
import { auth } from "../utils/firebaseConfig";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userData = await getUserDocument(currentUser.uid);
          setUser(userData);
          await updateActiveDays(currentUser.uid);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("獲取用戶資料失敗：", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUser = () => useContext(UserContext);

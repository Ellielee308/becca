import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";
import { message } from "antd";
import { useEffect } from "react";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useUser();
  useEffect(() => {
    if (!loading && !user) {
      message.warning("請先登入再繼續使用！");
    }
  }, [loading, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;

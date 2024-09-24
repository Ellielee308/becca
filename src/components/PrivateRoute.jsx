import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    alert("請先登入！");
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import UserAnalytics from "./pages/UserAnalytics";
import UserCardSets from "./pages/UserCardSets";
import CardSetDetail from "./pages/CardSetDetail";
import CardSetCreate from "./pages/CardSetCreate";
import CardSetEdit from "./pages/CardSetEdit";
import Quiz from "./pages/Quiz";
import PrivateRoute from "./components/PrivateRoute";
import { UserProvider } from "./context/UserContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route
              path="user/me/*"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="profile" element={<UserProfile />} />
              <Route path="analytics" element={<UserAnalytics />} />
              <Route path="cardsets" element={<UserCardSets />} />
            </Route>
            <Route
              path="cardset/:cardSetId"
              element={
                <PrivateRoute>
                  <CardSetDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="cardset/new"
              element={
                <PrivateRoute>
                  <CardSetCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="cardset/:cardsetId/edit"
              element={
                <PrivateRoute>
                  <CardSetEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="quiz/:quizId"
              element={
                <PrivateRoute>
                  <Quiz />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>
);

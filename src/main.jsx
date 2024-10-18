import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Layout from "./components/Layout.jsx";
import PrivateRoute from "./components/PrivateRoute";
import { UserProvider } from "./context/UserContext";
import CardSetCreate from "./pages/CardSetCreate";
import CardSetDetail from "./pages/CardSetDetail";
import CardSetEdit from "./pages/CardSetEdit";
import Game from "./pages/Game";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import SearchResult from "./pages/SearchResult";
import UserCardSets from "./pages/UserCardSets";
import UserProfile from "./pages/UserProfile";

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
              <Route path="cardsets" element={<UserCardSets />} />
            </Route>
            <Route path="cardset/:cardSetId" element={<CardSetDetail />} />
            <Route
              path="cardset/new"
              element={
                <PrivateRoute>
                  <CardSetCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="cardset/:cardSetId/edit"
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
            <Route path="search/:keyword" element={<SearchResult />} />
            <Route path="game/:gameId" element={<Game />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>
);

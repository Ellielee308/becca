import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import UserCardSets from "./pages/UserCardSets";
import CardSetDetail from "./pages/CardSetDetail";
import CardSetCreate from "./pages/CardSetCreate";
import CardSetEdit from "./pages/CardSetEdit";
import Quiz from "./pages/Quiz";
import SearchResult from "./pages/SearchResult";
import PrivateRoute from "./components/PrivateRoute";
import UserCollection from "./pages/UserCollection";
import Game from "./pages/Game";
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
              <Route path="cardsets" element={<UserCardSets />} />
              <Route path="collection" element={<UserCollection />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>
);

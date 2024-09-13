import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import UserAnalytics from "./pages/UserAnalytics";
import UserCardsets from "./pages/UserCardsets";
import CardSetDetail from "./pages/CardSetDetail";
import CardSetCreate from "./pages/CardSetCreate";
import CardSetEdit from "./pages/CardSetEdit";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="user/me/*" element={<Layout />}>
            <Route path="profile" element={<UserProfile />} />
            <Route path="analytics" element={<UserAnalytics />} />
            <Route path="cardsets" element={<UserCardsets />} />
          </Route>
          <Route path="cardset/:cardsetId" element={<CardSetDetail />} />
          <Route path="cardset/new" element={<CardSetCreate />} />
          <Route path="cardset/:cardsetId/edit" element={<CardSetEdit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

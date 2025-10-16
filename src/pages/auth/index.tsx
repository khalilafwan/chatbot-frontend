import { Routes, Route } from "react-router-dom";
import Login from "./login";
import Register from "./register";
import Chat from "../chat/chat";
import RequireAuth from "@auth-kit/react-router/RequireAuth";
import ChatRedirect from "../chat/chatRedirect";

import AdminDashboard from "../AdminDashboard";
import RequireAdmin from "@/components/guards/RequireAdmin";

export default function Auth() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/chat"
        element={
          <RequireAuth fallbackPath="/">
            <ChatRedirect />
          </RequireAuth>
        }
      />

      <Route
        path="/chat/:chatID"
        element={
          <RequireAuth fallbackPath="/">
            <Chat />
          </RequireAuth>
        }
      />

      {/* === ADMIN-ONLY ROUTE === */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }/>
    </Routes>
  );
}

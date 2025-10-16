import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";

export default function ChatRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const chatID = nanoid();
    navigate(`/chat/${chatID}`, { replace: true });
  }, [navigate]);

  return null; // Tidak perlu render apa pun
}
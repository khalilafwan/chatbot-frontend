import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { useEffect, useState, useRef } from "react";
import { message } from "../../interfaces/interfaces";
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import { nanoid } from "nanoid";
import { Navbar } from "@/components/custom/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import axios from "axios";
import { useChatStore } from "@/stores/chatStore";
import VoiceChatModal from "@/components/custom/VoiceChatModal";

export default function Chat() {
  const authHeader = useAuthHeader(); // Akan mengembalikan 'Bearer <token>'
  const { chatID } = useParams<{ chatID?: string }>();
  const navigate = useNavigate();

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { setActiveChatID } = useChatStore();

  // Buat chatID jika belum ada
  useEffect(() => {
    if (!chatID) {
      const newChatID = nanoid();
      localStorage.setItem('chatID', newChatID);
      setActiveChatID(newChatID);
      navigate(`/chat/${newChatID}`, { replace: true });
    }
    else {
      localStorage.setItem('chatID', chatID);
      setActiveChatID(chatID);

      // Ambil isi percakapan lama dari backend
      const fetchPreviousMessages = async () => {
        try {
          const res = await axios.get(
            `http://localhost:8888/chat/${chatID}/full`,
            {
              headers: {
                'Authorization': authHeader,
              },
            }
          );

          const data = res.data;

          const messagesArray = Array.isArray(data?.messages) ? data.messages : [];

          const formattedMessages = messagesArray.map((msg: any) => ({
            id: msg._id || nanoid(),
            content: msg.message,
            role: msg.sender === 'user' ? 'user' : 'assistant',
            type: msg.type || "text",
            audio_url: msg.audio_url,
            transcript: msg.transcript,
            intent: msg.intent,
            timestamp: msg.timestamp,
          }));

          setMessages(formattedMessages);
        } catch (error: any) {
          console.error("Gagal mengambil chat sebelumnya:", error?.response?.data || error.message);
          setMessages([]); // fallback tetap kosong
        }
      };

      fetchPreviousMessages();
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [chatID, navigate, authHeader, setActiveChatID]);

  async function handleSubmit(text?: string) {
    const messageText = text || question;
    if (!messageText || isLoading || !chatID) return;

    const traceId = nanoid();
    setIsLoading(true);

    const now = new Date().toISOString(); // tambahkan timestamp sekarang

    setMessages((prev) => [
      ...prev,
      { content: messageText, role: "user", id: traceId, timestamp: now },
    ]);
    setQuestion("");

    try {
      const res = await axios.post(
        `http://localhost:8888/chat/${chatID}`,
        { message: messageText },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
        }
      );

      const data = res.data;

      const botTimestamp = data.timestamp || new Date().toISOString();

      setMessages((prev) => [
        ...prev,
        { content: data.message || "Tidak ada jawaban", role: "assistant", id: nanoid(), timestamp: botTimestamp, },
      ]);
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        await useChatStore.getState().fetchChats(token);
      }
      setActiveChatID(chatID);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      setMessages((prev) => [
        ...prev,
        { content: "Terjadi kesalahan. Coba lagi nanti.", role: "assistant", id: nanoid(), timestamp: new Date().toISOString(), },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Fungsi polling: cek setiap beberapa detik apakah ada pesan baru
  function startPollingForNewMessages(chatID: string, currentLastTimestamp: string) {
    if (pollingIntervalRef.current) return; // Jangan dobel polling

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:8888/chat/${chatID}/full`, {
          headers: { 'Authorization': authHeader }
        });

        const newMessages = res.data?.messages || [];
        const lastMsg = newMessages[newMessages.length - 1];

        if (lastMsg?.timestamp > currentLastTimestamp) {
          const formattedMessages = newMessages.map((msg: any) => ({
            id: msg._id || nanoid(),
            content: msg.message,
            role: msg.sender === 'user' ? 'user' : 'assistant',
            type: msg.type || "text",
            audio_url: msg.audio_url,
            transcript: msg.transcript,
            intent: msg.intent,
            timestamp: msg.timestamp,
          }));

          setMessages(formattedMessages);

          // Stop polling jika ada pesan bot
          if (lastMsg.sender === "bot") {
            clearInterval(pollingIntervalRef.current!);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000); // Cek setiap 2 detik
  }

  return (
    <>
      <div className="flex h-screen w-screen bg-background">
        {/* Sidebar */}
        <div className="w-[300px]">
          <Navbar />
        </div>

        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 min-w-0">
          <Header />

          <div
            className="flex flex-col gap-6 flex-1 overflow-y-scroll pt-4"
            ref={messagesContainerRef}
          >
            {messages.length === 0 && <Overview />}
            {messages.map((message, index) => (
              <PreviewMessage key={index} message={message} />
            ))}
            {isLoading && <ThinkingMessage />}
            <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />

          </div>

          <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
            <ChatInput
              question={question}
              setQuestion={setQuestion}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      <VoiceChatModal
        onVoiceComplete={() => {
          const lastTimestamp = messages[messages.length - 1]?.timestamp || new Date().toISOString();
          if (chatID) {
            startPollingForNewMessages(chatID, lastTimestamp);
          }
        }}
      />
    </>
  );
}

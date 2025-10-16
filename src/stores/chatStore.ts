import { create } from 'zustand';
import axios from 'axios';
import { ChatItem } from '@/interfaces/interfaces';

interface ChatState {
  chats: ChatItem[];
  activeChatID: string | null;

  fetchChats: (token: string) => Promise<void>;
  addChat: (chat: ChatItem) => void;
  setActiveChatID: (id: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChatID: localStorage.getItem('chat_id') || null,

  fetchChats: async (token: string) => {
    try {
      const res = await axios.get('http://localhost:8888/chat/list', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const chatList: ChatItem[] = res.data?.data || [];
      set({ chats: chatList });
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  },

  addChat: (chat: ChatItem) => {
    const existingChats = get().chats;
    const isDuplicate = existingChats.some(c => c.chat_id === chat.chat_id);
    if (!isDuplicate) {
      set({ chats: [...existingChats, chat] });
    }
  },

  setActiveChatID: (id: string) => {
    localStorage.setItem('chat_id', id);
    set({ activeChatID: id });
  },
}));

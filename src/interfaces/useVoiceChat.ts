import { create } from 'zustand';

interface VoiceChatState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useVoiceChat = create<VoiceChatState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
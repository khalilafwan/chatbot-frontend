export interface message{
  id:string;
  role:string;
  content?: string;
  type?: "text" | "voice";
  audio_url?: string;
  transcript?: string;
  intent?: string;
  timestamp: string;
}

export type ChatItem = {
  chat_id: string;
  chat_title: string;
  updated_at: string;
};

export interface Chat {
  chat_id: string;
  chat_title: string;
}

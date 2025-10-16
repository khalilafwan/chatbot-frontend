import axios from "axios";
import type FormData from 'form-data';

export const loginUser = async ({ username, password }: { username: string; password: string }) => {
  const res = await fetch('http://localhost:1234/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error('Login failed');

  return await res.json();
};

export const logoutUser = async (token: string) => {
  const res = await fetch('http://localhost:1234/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Logout failed');
  return await res.json();
};

export const getChatList = async (token: string) => {
  const res = await fetch('http://localhost:1234/chat/list', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch chat list');
  return await res.json();
};

export const getChatById = async (chatId: string, token: string) => {
  const res = await fetch(`http://localhost:1234/chat/${chatId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch chat');
  return await res.json();
};

export const sendMessageToChatbot = async ({
  chatId,
  token,
  message,
}: {
  chatId: string;
  token: string;
  message: string;
}) => {
  const res = await fetch(`http://localhost:1234/chat/${chatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) throw new Error('Failed to send message to chatbot');

  return await res.json();
};


export const deleteChatById = async (chatId: string, token: string) => {
  const res = await fetch(`http://localhost:1234/chat/${chatId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to delete chat');
  return await res.json();
};

export const renameChatById = async (
  chatId: string,
  newTitle: string,
  token: string
) => {
  const res = await fetch(`http://localhost:1234/chat/${chatId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title: newTitle }),
  });

  if (!res.ok) throw new Error('Failed to rename chat');
  return await res.json();
};

export async function uploadVoiceToChatbot({
  token,
  formData,
}: {
  token: string;
  formData: FormData;
}) {
  const response = await axios.post(`http://localhost:1234/voice/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
      ...formData.getHeaders(),
    },
  });

  return response.data;
}
import path from 'path';
import { Pact } from '@pact-foundation/pact';
import { Matchers } from '@pact-foundation/pact';
const { like } = Matchers;
import { getChatList, getChatById, sendMessageToChatbot, renameChatById, deleteChatById } from './api';

const provider = new Pact({
  consumer: 'ReactFrontend',
  provider: 'GoBackend',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact-chat.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'info',
});


describe('Pengujian Pact - Fitur Chat', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());

  // GET /chat/list
  it('Berhasil mengembalikkan daftar percakapan user', async () => {
    await provider.addInteraction({
      state: 'user has chat conversations',
      uponReceiving: 'a GET request to /chat/list',
      withRequest: {
        method: 'GET',
        path: '/chat/list',
        headers: { 'Authorization': 'Bearer mocked-jwt-token' },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: [
          {
            chat_id: 'abc123',
            chat_title: 'Pertanyaan Syarat Buka Tabungan',
            created_at: '2025-08-01T12:00:00Z',
          },
          {
            chat_id: 'def456',
            chat_title: 'Pertanyaan seputar layanan Bank Nagari',
            created_at: '2025-08-02T15:30:00Z',
          },
        ],
      },
    });

    const list = await getChatList('mocked-jwt-token');
    expect(list.length).toBe(2);
    expect(list[0].chat_title).toBe('Pertanyaan Syarat Buka Tabungan');
  });

  // GET /chat/:chatid
  it('Berhasil mengembalikan konten chat user berdasarkan chat ID', async () => {
    await provider.addInteraction({
      state: 'chat with ID abc123 exists',
      uponReceiving: 'a GET request to /chat/abc123',
      withRequest: {
        method: 'GET',
        path: '/chat/abc123',
        headers: { 'Authorization': 'Bearer mocked-jwt-token' },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          chat_id: 'abc123',
          messages: [
            {
              sender: 'user',
              type: 'text',
              content: 'Apa itu tabungan simpeda?',
              timestamp: '2025-08-01T12:01:00Z',
            },
            {
              sender: 'bot',
              type: 'text',
              content: 'Tabungan simpeda adalah ...',
              timestamp: '2025-08-01T12:01:05Z',
            },
          ],
        },
      },
    });

    const data = await getChatById('abc123', 'mocked-jwt-token');
    expect(data.chat_id).toBe('abc123');
    expect(data.messages[0].sender).toBe('user');
  });

  it('Berhasil mengirim pesan ke chatbot', async () => {
  const chatId = 'abc123xyz';
  const token = 'fake-jwt-token';
  const userMessage = 'Halo, saya ingin tanya tentang tabungan';

  await provider.addInteraction({
    state: 'chat room exists with given chatId',
    uponReceiving: 'a POST request to /chat/:chatid with user message',
    withRequest: {
      method: 'POST',
      path: `/chat/${chatId}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: {
        message: userMessage,
      },
    },
    willRespondWith: {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        reply: like('Terima kasih atas pertanyaannya.'),
      },
    },
  });

  const response = await sendMessageToChatbot({
    chatId,
    token,
    message: userMessage,
  });

  expect(response).toHaveProperty('reply');
});

  // PUT /chat/:chatid/rename
  it('Berhasil memperbarui judul room chat', async () => {
  await provider.addInteraction({
    state: 'chat with id abc123 exists',
    uponReceiving: 'a PUT request to rename chat abc123',
    withRequest: {
      method: 'PUT',
      path: '/chat/abc123',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mocked-jwt-token',
      },
      body: {
        title: 'Renamed Chat Title',
      },
    },
    willRespondWith: {
      status: 200,
      body: {
        message: like('Chat renamed successfully'),
      },
    },
  });

  const response = await renameChatById(
    'abc123',
    'Renamed Chat Title',
    'mocked-jwt-token'
  );

  expect(response.message).toBe('Chat renamed successfully');
});

  // DELETE /chat/:chatid
  it('Berhasil menghapus room chat', async () => {
  await provider.addInteraction({
    state: 'chat with id abc123 exists',
    uponReceiving: 'a DELETE request to /chat/abc123',
    withRequest: {
      method: 'DELETE',
      path: '/chat/abc123',
      headers: {
        'Authorization': 'Bearer mocked-jwt-token',
      },
    },
    willRespondWith: {
      status: 200,
      body: {
        message: like('Chat deleted successfully'),
      },
    },
  });

  const response = await deleteChatById('abc123', 'mocked-jwt-token');
  expect(response.message).toBe('Chat deleted successfully');
});
});

 
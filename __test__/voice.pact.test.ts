import path from 'path';
import { Pact } from '@pact-foundation/pact';
import { Matchers } from '@pact-foundation/pact';
const { like } = Matchers;
import { uploadVoiceToChatbot } from './api';
import { readFileSync } from 'fs';
import FormData from 'form-data';

const provider = new Pact({
  consumer: 'ReactFrontend',
  provider: 'GoBackend',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact-chat.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'info',
});

describe('Pengujian Pact - Fitur Voice', () => {
  const token = 'fake-jwt-token';

  beforeAll(() => provider.setup());
  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  it('Berhasil unggah pesan suara ke chatbot', async () => {
    const audioPath = path.resolve(__dirname, './voice-1754298546847.webm');
    const fakeAudioBuffer = readFileSync(audioPath);

    const formData = new FormData();
    formData.append('voice', fakeAudioBuffer, {
      filename: 'voice-1754298546847.webm',
      contentType: 'audio/webm',
    });
    formData.append('chat_id', 'abc123xyz');

    await provider.addInteraction({
      state: 'Siap menerima unggahan suara dari user',
      uponReceiving: 'a POST request to /voice/upload with voice file',
      withRequest: {
        method: 'POST',
        path: '/voice/upload',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          reply: like('Halo, ini respon dari suara Anda.'),
        },
      },
    });

    const result = await uploadVoiceToChatbot({formData, token});

expect(result).toHaveProperty('reply');
  });
});

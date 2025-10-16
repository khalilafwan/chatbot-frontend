import path from 'path';
import { Pact } from '@pact-foundation/pact';
import { loginUser, logoutUser } from './api';

const provider = new Pact({
  consumer: 'ReactFrontend',
  provider: 'GoBackend',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'info',
});

describe('Pengujian Pact - Autentikasi', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());
  afterEach(() => provider.verify());

  it('Berhasil login menggunakan kredensial yang benar', async () => {
    await provider.addInteraction({
      state: 'Pengguna terdaftar dan kredensialnya benar',
      uponReceiving: 'a POST request to /login',
      withRequest: {
        method: 'POST',
        path: '/login',
        headers: { 'Content-Type': 'application/json' },
        body: {
          username: 'admin',
          password: 'admin123',
        },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          token: 'mocked-jwt-token',
          username: 'admin',
        },
      },
    });

    const response = await loginUser({
      username: 'admin',
      password: 'admin123',
    });

    expect(response).toEqual({
      token: 'mocked-jwt-token',
      username: 'admin',
    });
  });

  it('Berhasil logout', async () => {
    await provider.addInteraction({
      state: 'user telah log in',
      uponReceiving: 'a POST request to /logout',
      withRequest: {
        method: 'POST',
        path: '/logout',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mocked-jwt-token',
        },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          message: 'Sukses log out',
        },
      },
    });

    const response = await logoutUser('mocked-jwt-token');
    expect(response).toEqual({ message: 'Sukses log out' });
  });
});

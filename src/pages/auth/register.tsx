import { Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { IconCheck, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { RegisterTitle } from '@/components/authentication/RegisterTitle';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { UserType } from '@/types/userData';

export default function Register() {
  const navigate = useNavigate();
  const signIn = useSignIn<UserType>();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
    },

    validate: {
      username: (value) =>
        value.length < 3 ? 'Username must be at least 3 characters' : null,
      password: (value) =>
        value.length < 6 ? 'Password must be at least 6 characters' : null,
    },
  });

  const handleRegister = async () => {
    try {
      const { username, password } = form.getValues();

      // Step 1: Register
      await axios.post('http://localhost:8888/auth/register', { username, password });

      // Step 2: Auto login setelah register
      const loginRes = await axios.post('http://localhost:8888/auth/login', { username, password });
      const { token, id, role, status, last_chat_id } = loginRes.data;

      const success = signIn({
        auth: {
          token: token,
          type: 'Bearer',
        },
        userState: {
          id,
          username,
          role,
          status,
        },
      });

      if (success) {
        showNotification({
          title: 'Berhasil!',
          message: 'Pendaftaran dan login berhasil.',
          color: 'green',
          icon: <IconCheck />,
        });

        if (last_chat_id) {
          navigate(`/chat/${last_chat_id}`);
        } else {
          navigate('/chat');
        }
      } else {
        throw new Error('Sign in gagal');
      }
    } catch (err) {
      console.error(err);
      showNotification({
        title: 'Gagal!',
        message: 'Pendaftaran gagal.',
        color: 'red',
        icon: <IconX />,
      });
    }
  };

  return (
    <Box
      h="100vh"
      w="100vw"
      display="flex"
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        miw={400}
        bg="white"
        p={20}
        style={{ borderRadius: 10, boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
      >
        <RegisterTitle form={form} onSubmit={handleRegister} />
      </Box>
    </Box>
  );
}

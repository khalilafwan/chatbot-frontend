import { Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { AuthenticationTitle } from '@/components/authentication/AuthenticationTitle';
import { UserType } from '@/types/userData';

export default function Login() {
  const navigate = useNavigate();
  const signIn = useSignIn<UserType>();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: '',
    },

    validate: {
      username: (value) => value.length < 3 ? 'Username harus bernilai lebih dari 6 karakter' : null,
      password: (value) => value.length < 6 ? 'Password harus bernilai lebih dari 6 karakter' : null,
    },
  });

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      const res = await axios.post('http://localhost:8888/auth/login', values);
      console.log("res.data:", res.data);

      const { token, username, role, status, id, last_chat_id } = res.data;

      const success = signIn({
        auth: {
          token,
          type: 'Bearer',
        },
        userState: {
          id: id,
          username: username,
          role: role,
          status: status,
        },
      });

      console.log("SignIn success:", success);
      if (success) {
        if (last_chat_id) {
          navigate(`/chat/${last_chat_id}`);
        } else {
          navigate('/chat');
        }
      } else {
        alert('Gagal menyimpan sesi');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Login gagal. Periksa kredensial Anda.');
    }
  };

  return (
    <Box h="100vh" w="100vw" display="flex" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Box miw={400} bg="white" p={20} style={{ borderRadius: 10, boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.2)' }}>
        <AuthenticationTitle form={form} onSubmit={() => handleSubmit(form.getValues())} />
      </Box>
    </Box>
  );
}

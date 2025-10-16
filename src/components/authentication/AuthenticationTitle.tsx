import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import classes from './AuthenticationTitle.module.css';
import { Link } from 'react-router';
import { UseFormReturnType } from '@mantine/form';

interface Props {
  form: UseFormReturnType<{ username: string; password: string }>;
  onSubmit: () => void;
}


export function AuthenticationTitle({ form, onSubmit }: Props) {
  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Chatbot Nagari
      </Title>

      <Text className={classes.subtitle}>
        Belum memiliki akun? <Anchor><Link to="/register">Daftar Disini</Link></Anchor>
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            label="Username"
            placeholder="Username anda"
            required
            radius="md"
            {...form.getInputProps('username')}
          />
          <PasswordInput
            label="Password"
            placeholder="Password anda"
            required
            mt="md"
            radius="md"
            {...form.getInputProps('password')}
          />
          <Button type="submit" fullWidth mt="xl" radius="md" className={classes.signInButton}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
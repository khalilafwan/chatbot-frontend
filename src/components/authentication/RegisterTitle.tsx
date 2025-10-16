import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  TextInput,
  Title,
} from '@mantine/core';
import classes from './AuthenticationTitle.module.css';
import { Link } from 'react-router-dom';

export function RegisterTitle({ form, onSubmit }: { form: any; onSubmit: () => void }) {
  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Daftar Akun
      </Title>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md" component="form" onSubmit={form.onSubmit(onSubmit)}>
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

        <Group justify="space-between" mt="lg">
          <Anchor component={Link} to="/" size="sm">
            Sudah memiliki akun?
          </Anchor>
        </Group>

        <Button fullWidth mt="xl" radius="md" type="submit">
          Sign up
        </Button>
      </Paper>
    </Container>
  );
}

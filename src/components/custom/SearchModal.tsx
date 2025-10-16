import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  Divider,
  ScrollArea,
  UnstyledButton,
  Box,
  Text,
  Kbd,
} from '@mantine/core';
import { IconSearch, IconMessagePlus } from '@tabler/icons-react';

export type ChatSummary = {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt?: string | Date;
};

type SearchModalProps = {
  opened: boolean;
  onClose: () => void;

  // Data chat yang mau dicari
  chats: ChatSummary[];

  // Aksi ketika memilih chat / bikin chat baru
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;

  // Opsional: placeholder & label
  title?: string;
  placeholder?: string;

  // Opsional: apakah Enter memilih hasil pertama
  selectFirstOnEnter?: boolean;
};

export default function SearchModal({
  opened,
  onClose,
  chats,
  onSelectChat,
  onCreateNewChat,
  title = 'Cari Chat',
  placeholder = 'Cari percakapan…',
  selectFirstOnEnter = true,
}: SearchModalProps) {
  const [query, setQuery] = useState('');

  // Reset query saat modal dibuka/ditutup
  useEffect(() => {
    if (!opened) setQuery('');
  }, [opened]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats.slice(0, 50);
    return chats
      .filter((c) => {
        const hay = `${c.title ?? ''} ${c.lastMessage ?? ''}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 50);
  }, [query, chats]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && selectFirstOnEnter) {
      if (filtered[0]) {
        onSelectChat(filtered[0].id);
        onClose();
      } else if (query.trim()) {
        // kalau tak ada hasil tapi ada query, boleh langsung create baru
        onCreateNewChat();
        onClose();
      }
    }

    if (e.key === 'Escape') {
      onClose();
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" w="100%">
          <Text fw={600}>{title}</Text>
          <Group gap="xs">
            <Text size="xs" c="dimmed">Tutup</Text>
            <Kbd>Esc</Kbd>
          </Group>
        </Group>
      }
      size="lg"
      radius="md"
      centered
      trapFocus
      withinPortal
    >
      <Stack gap="sm">
        <TextInput
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          leftSection={<IconSearch size={18} />}
          rightSection={query ? (
            <Button
              variant="subtle"
              size="compact-xs"
              onClick={() => setQuery('')}
            >
              Bersihkan
            </Button>
          ) : null}
        />

        <Button
          variant="light"
          onClick={() => {
            onCreateNewChat();
            onClose();
          }}
          leftSection={<IconMessagePlus size={18} />}
        >
          Buat Chat Baru
        </Button>

        <Divider label="Hasil" />

        <ScrollArea.Autosize mah={360} type="hover">
          <Stack gap={4}>
            {filtered.length === 0 ? (
              <Box p="md">
                <Text c="dimmed" size="sm">
                  Tidak ada hasil. Tekan <Kbd>Enter</Kbd> untuk membuat chat baru.
                </Text>
              </Box>
            ) : (
              filtered.map((c) => (
                <UnstyledButton
                  key={c.id}
                  onClick={() => {
                    onSelectChat(c.id);
                    onClose();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                  }}
                  className="search-result-item"
                >
                  <Text fw={600} size="sm" truncate="end">
                    {c.title || 'Tanpa judul'}
                  </Text>
                  {c.lastMessage ? (
                    <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                      {c.lastMessage}
                    </Text>
                  ) : null}
                </UnstyledButton>
              ))
            )}
          </Stack>
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
}
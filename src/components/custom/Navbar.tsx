import {
  IconMessagePlus,
  IconSearch,
  IconPlus,
  IconDots,
  IconPencil,
  IconTrash,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Code,
  Group,
  Menu,
  Modal,
  NavLink,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useChatStore } from '@/stores/chatStore';
import { UserButton } from './UserButton';
import classes from './Navbar.module.css';
import BankNagariLogo from "@/assets/img/Bank_Nagari.svg";
import { ChatItem } from '@/interfaces/interfaces';

export function Navbar() {
  const navigate = useNavigate();
  const { chats, fetchChats } = useChatStore();
  const [activeChatId, setActiveChatId] = useState<string | null>(
    localStorage.getItem('chat_id')
  );
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  useEffect(() => {
    const storedChatId = localStorage.getItem('chat_id');
    if (storedChatId !== activeChatId) {
      setActiveChatId(storedChatId);
    }
    const token = localStorage.getItem('_auth');
    if (token && typeof fetchChats === 'function') {
      fetchChats(token);
    }

    const handleRefresh = () => {
      if (token && typeof fetchChats === 'function') {
        fetchChats(token);
      }
    };

    const handleNewChatCreated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newChatId = customEvent.detail?.chat_id;
      if (newChatId) {
        setActiveChatId(newChatId);
        localStorage.setItem('chat_id', newChatId);
        navigate(`/chat/${newChatId}`);
      }
    };

    window.addEventListener('chatListShouldRefresh', handleRefresh);
    window.addEventListener('newChatCreated', handleNewChatCreated);

    return () => {
      window.removeEventListener('chatListShouldRefresh', handleRefresh);
      window.removeEventListener('newChatCreated', handleNewChatCreated);
    };
  }, [fetchChats, navigate]);

  const handleChatClick = (chatId: string) => {
    setActiveChatId(chatId);
    localStorage.setItem('chat_id', chatId);
    navigate(`/chat/${chatId}`);
  };

  const links = [
    {
      icon: IconMessagePlus,
      label: 'Chat Baru',
      onClick: () => {
        localStorage.removeItem('chat_id'); // hapus chat_id lama agar tidak salah aktif
        setActiveChatId(null); // reset state juga
        navigate('/chat');
      },
    },
    
  ];

  const mainLinks = links.map((link) => (
    <UnstyledButton
      key={link.label}
      className={classes.mainLink}
      onClick={link.onClick}
    >
      <div className={classes.mainLinkInner}>
        <link.icon size={20} className={classes.mainLinkIcon} stroke={1.5} />
        <span>{link.label}</span>
      </div>
    </UnstyledButton>
  ));

  const collectionLinks = Array.isArray(chats) && chats.length > 0
    ? chats.map((chat) => (
      <div key={chat.chat_id} className={classes.chatItem} onMouseLeave={() => setEditingChatId(null)}>
        <div className={classes.chatItemContent}>
          {editingChatId === chat.chat_id ? (
            <TextInput
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.currentTarget.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  try {
                    const token = localStorage.getItem("_auth");
                    await fetch(`http://localhost:8888/chat/${chat.chat_id}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ new_title: editedTitle }),
                    });
                    setEditingChatId(null);
                    window.dispatchEvent(new CustomEvent("chatListShouldRefresh"));
                  } catch (err) {
                    console.error("Rename failed", err);
                  }
                } else if (e.key === "Escape") {
                  setEditingChatId(null);
                }
              }}
              onBlur={() => setEditingChatId(null)}
              autoFocus
              variant="unstyled"
              className={classes.collectionLink}
              styles={{
                input: {
                  padding: '8px var(--mantine-spacing-xs)',
                  fontSize: 'var(--mantine-font-size-xs)',
                  fontWeight: 500,
                  lineHeight: 1,
                  borderRadius: 'var(--mantine-radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  width: '100%',
                },
              }}
            />
          ) : (
            <NavLink
              label={chat.chat_title}
              onClick={() => handleChatClick(chat.chat_id)}
              active={activeChatId === chat.chat_id}
              className={`${classes.collectionLink} ${classes.link}`}
            />
          )}

          <Menu withinPortal position="right-start" shadow="md" width={150}>
            <Menu.Target>
              <ActionIcon size="sm" variant="subtle" className={classes.chatItemAction}>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconPencil size={14} />}
                onClick={() => {
                  setEditingChatId(chat.chat_id);
                  setEditedTitle(chat.chat_title);
                }}
              >
                Rename
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => setConfirmDelete(chat)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    ))
    : <Text size="xs" c="dimmed" px="sm">Belum ada percakapan</Text>;

  const [confirmDelete, setConfirmDelete] = useState<ChatItem | null>(null);

  const handleDeleteChat = async () => {
    if (!confirmDelete) return;
    const token = localStorage.getItem('_auth');
    try {
      await fetch(`http://localhost:8888/chat/${confirmDelete.chat_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfirmDelete(null);
      window.dispatchEvent(new CustomEvent('chatListShouldRefresh'));
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };


  return (
    <>
      <nav className={classes.navbar}>
        <Box className={classes.logoWrapper} mb="sm">
          <img src={BankNagariLogo} alt="Bank Nagari" className={classes.logo} />
        </Box>

       

        <div className={classes.section}>
          <div className={classes.mainLinks}>{mainLinks}</div>
        </div>

        <div className={classes.section}>
          <Group className={classes.collectionsHeader} justify="space-between">
            <Text size="xs" fw={500}>
              Histori Percakapan 
            </Text>
            {/* <img src={BankNagariLogo} alt="Bank Nagari" className={classes.logo} /> */}
          </Group>
          <div className={classes.collections}>{collectionLinks}</div>
        </div>

        <div className={classes.userSection}>
          <UserButton />
        </div>
      </nav>
      <Modal
        opened={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Hapus Chat?"
        centered
      >
        <Text mb="sm">
          Yakin ingin menghapus chat{' '}
          <strong>{confirmDelete?.chat_title}</strong>?
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setConfirmDelete(null)}>
            Batal
          </Button>
          <Button color="red" onClick={handleDeleteChat}>
            Hapus
          </Button>
        </Group>
      </Modal>
    </>
  );
}

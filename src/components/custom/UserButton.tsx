import {
  Avatar,
  Group,
  Text,
  UnstyledButton,
  Menu,
  Modal,
  Button,
} from "@mantine/core";
import {
  IconChevronRight,
  IconLogout,
  IconLayoutDashboard, // 🧭 icon dashboard
} from "@tabler/icons-react";
import { useState } from "react";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import classes from "./UserButton.module.css";
import { UserType } from "@/types/userData";

export function UserButton() {
  const [opened, setOpened] = useState(false);
  const user = useAuthUser<UserType>();
  const signOut = useSignOut();
  const navigate = useNavigate();

  if (!user) {
    return <div>User belum login</div>;
  }

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8888/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("_auth")}`,
          },
        }
      );

      signOut();
      localStorage.removeItem("chat_id");
      localStorage.removeItem("chatID");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      alert("Gagal logout.");
    } finally {
      setOpened(false);
    }
  };

  return (
    <>
      <Menu width={200} shadow="md" position="top-start">
        <Menu.Target>
          <UnstyledButton className={classes.user}>
            <Group>
              <Avatar color="yellow" radius="xl">
                {user.username?.charAt(0)?.toUpperCase() || "?"}
              </Avatar>

              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {user.username || "Guest"}
                </Text>

                <Text c="dimmed" size="xs">
                  {user.role || user.status || "Role unknown"}
                </Text>
              </div>

              <IconChevronRight size={14} stroke={1.5} />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          {/* 🔹 Hanya tampil jika user admin */}
          {(user.role === "admin" || user.status === "admin") && (
            <Menu.Item
              leftSection={<IconLayoutDashboard size={16} />}
              onClick={() => navigate("/admin")}
            >
              Admin Dashboard
            </Menu.Item>
          )}

          <Menu.Item
            color="red"
            leftSection={<IconLogout size={16} />}
            onClick={() => setOpened(true)}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Konfirmasi Logout"
        centered
      >
        <Text mb="md">Apakah Anda yakin ingin logout?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setOpened(false)}>
            Batal
          </Button>
          <Button color="red" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Modal>
    </>
  );
}

// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Card,
  Text,
  Table,
  Loader,
  Center,
  Button,
  ActionIcon,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import axios from "axios";

type Metrics = {
  total_users: number;
  total_conversations: number;
  total_messages: number;
};

type ConversationSummary = {
  chat_id: string;
  username?: string;
  last_message_at?: string | null;
};

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    total_users: 0,
    total_conversations: 0,
    total_messages: 0,
  });
  const [rows, setRows] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("_auth");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [r1, r2] = await Promise.all([
          axios.get("http://localhost:8888/admin/metrics", { headers: authHeader }),
          axios.get("http://localhost:8888/admin/conversations?limit=10", {
            headers: authHeader,
          }),
        ]);

        if (!mounted) return;

        const m: Metrics = {
          total_users: Number(r1.data?.total_users ?? 0),
          total_conversations: Number(r1.data?.total_conversations ?? 0),
          total_messages: Number(r1.data?.total_messages ?? 0),
        };
        setMetrics(m);

        const convos: ConversationSummary[] = Array.isArray(r2.data) ? r2.data : [];
        setRows(convos);
      } catch (err: any) {
        console.error("Failed to load admin data:", err);
        setError(
          err?.response?.data?.error ??
            err?.message ??
            "Gagal memuat data. Pastikan token dan endpoint benar."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function formatDate(value?: string | null) {
    if (!value) return "-";
    const asNum = Number(value);
    if (!Number.isNaN(asNum) && asNum > 0) {
      const maybeMs = asNum < 1e12 ? asNum * 1000 : asNum;
      return new Date(maybeMs).toLocaleString();
    }
    const dt = new Date(value);
    if (!isNaN(dt.getTime())) return dt.toLocaleString();
    return String(value);
  }

  // TopNav: gunakan div + flex agar compatible
  const TopNav = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        // pastikan area judul menonjol pada background biru aplikasi
        padding: "12px 16px",
        borderRadius: 8,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <ActionIcon
          component={Link as any}
          to="/chat"
          variant="transparent"
          size="lg"
          style={{ color: "white", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <IconArrowLeft />
        </ActionIcon>

        <div>
          <Text fw={700} style={{ color: "white", fontSize: 18 }}>
            Admin Dashboard
          </Text>
          <Text size="xs" style={{ color: "white", opacity: 0.9 }}>
            Ringkasan sistem & percakapan terbaru
          </Text>
        </div>
      </div>

      <Button
        variant="outline"
        size="xs"
        onClick={() => {
          window.location.reload();
        }}
        style={{
          color: "white",
          borderColor: "rgba(255,255,255,0.6)",
          background: "transparent",
        }}
      >
        Refresh
      </Button>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <TopNav />

      {loading ? (
        <Center style={{ minHeight: 240 }}>
          <Loader />
        </Center>
      ) : error ? (
        <Card shadow="sm" p="md" mb="md" withBorder>
          <Text color="red" fw={700}>
            Error
          </Text>
          <Text size="sm" mt="sm">
            {error}
          </Text>
          <div style={{ marginTop: 12 }}>
            <Button onClick={() => window.location.reload()}>Coba lagi</Button>
          </div>
        </Card>
      ) : (
        <>
          <Grid mb="md">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Card shadow="sm" p="md">
                <Text fw={700}>Total Users</Text>
                <Text fz="xl">{metrics.total_users}</Text>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Card shadow="sm" p="md">
                <Text fw={700}>Total Conversations</Text>
                <Text fz="xl">{metrics.total_conversations}</Text>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Card shadow="sm" p="md">
                <Text fw={700}>Total Messages</Text>
                <Text fz="xl">{metrics.total_messages}</Text>
              </Card>
            </Grid.Col>
          </Grid>

          <Card shadow="sm" p="md">
            <Text fw={700} mb="sm">
              Percakapan Terbaru
            </Text>

            {/* table wrapper dengan tableLayout:fixed supaya kolom sejajar */}
            <div style={{ overflowX: "auto" }}>
              <Table
                striped
                highlightOnHover
                withRowBorders
                // style tambahan untuk memastikan kolom konsisten
                style={{ tableLayout: "fixed", width: "100%" }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "40%", textAlign: "left", padding: "12px" }}>
                      Chat ID
                    </th>
                    <th style={{ width: "30%", textAlign: "left", padding: "12px" }}>
                      Username
                    </th>
                    <th style={{ width: "30%", textAlign: "left", padding: "12px" }}>
                      Last Message At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={3}>
                        <Text color="dimmed">Belum ada percakapan</Text>
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.chat_id}>
                        <td
                          style={{
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            padding: "12px",
                          }}
                          title={r.chat_id}
                        >
                          {r.chat_id}
                        </td>
                        <td style={{ padding: "12px" }}>{r.username ?? "-"}</td>
                        <td style={{ padding: "12px" }}>{formatDate(r.last_message_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

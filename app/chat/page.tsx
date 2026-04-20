"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatSidebar, { type ChatSessionSummary } from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function ChatPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function getUserEmail() {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user.email) {
        setUserEmail(data.session.user.email);
      }
    }
    void getUserEmail();
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function loadSessions() {
      setIsLoadingSessions(true);
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(30);

      if (!isMounted) {
        return;
      }

      if (error) {
        setIsLoadingSessions(false);
        return;
      }

      setSessions((data as ChatSessionSummary[]) ?? []);
      setIsLoadingSessions(false);
    }

    void loadSessions();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  function upsertSession(sessionId: string, title: string) {
    const nextSession: ChatSessionSummary = {
      id: sessionId,
      title,
      updated_at: new Date().toISOString(),
    };

    setSessions((current) => {
      const filtered = current.filter((session) => session.id !== sessionId);
      return [nextSession, ...filtered].slice(0, 30);
    });
    setCurrentSessionId(sessionId);
  }

  async function handleDeleteSession(sessionId: string) {
    const session = sessions.find((item) => item.id === sessionId);
    const shouldDelete = window.confirm(
      `Delete "${session?.title || "this chat"}"? This cannot be undone.`,
    );

    if (!shouldDelete) {
      return;
    }

    const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId);

    if (error) {
      return;
    }

    setSessions((current) => current.filter((session) => session.id !== sessionId));

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#F3F7F4]">
      {/* Sidebar is driven from local session state so chat switches feel instant. */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={currentSessionId}
        isLoading={isLoadingSessions}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={() => setCurrentSessionId(null)}
        onSelectSession={(sessionId) => setCurrentSessionId(sessionId)}
        onDeleteSession={(sessionId) => void handleDeleteSession(sessionId)}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      <div className="flex min-h-screen flex-1 md:pl-0">
        <ChatWindow
          sessionId={currentSessionId}
          sessionTitle={sessions.find((session) => session.id === currentSessionId)?.title ?? null}
          onSessionCreate={upsertSession}
          onSessionUpdate={upsertSession}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  );
}

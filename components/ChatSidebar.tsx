"use client";

import Link from "next/link";

export type ChatSessionSummary = {
  id: string;
  title: string;
  updated_at: string;
};

type ChatSidebarProps = {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
};

function truncateTitle(title: string) {
  return title.length > 30 ? `${title.slice(0, 30)}...` : title;
}

function formatTimeAgo(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  isLoading,
  isOpen,
  onClose,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: ChatSidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-[#111827]/45 transition md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[#DCFCE7] bg-[#F7FEF8] shadow-[0_24px_60px_rgba(22,163,74,0.12)] transition-transform md:static md:translate-x-0 md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-[#DCFCE7] px-4 pb-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#166534]">
              investAI {"\u{1F91D}"}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#166534] transition hover:bg-[#DCFCE7] md:hidden"
              aria-label="Close sidebar"
            >
              {"\u2715"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            <span className="text-base leading-none">+</span>
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="animate-pulse rounded-2xl border border-transparent bg-white px-3 py-3"
                >
                  <div className="h-4 w-3/4 rounded-full bg-[#DCFCE7]" />
                  <div className="mt-2 h-3 w-1/3 rounded-full bg-[#E5E7EB]" />
                </div>
              ))
            ) : sessions.length > 0 ? (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;

                return (
                  <div
                    key={session.id}
                    className={`group w-full rounded-2xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-green-200 bg-[#DCFCE7] shadow-sm"
                        : "border-transparent bg-white hover:border-green-100 hover:bg-[#F0FDF4]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {truncateTitle(session.title || "New Chat")}
                        </p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          {formatTimeAgo(session.updated_at)}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSession(session.id)}
                        className="rounded-full px-2 py-1 text-xs text-[#6B7280] opacity-0 transition hover:bg-white hover:text-red-500 group-hover:opacity-100"
                        aria-label={`Delete ${session.title || "chat session"}`}
                      >
                        {"\u2715"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[#BBF7D0] bg-white px-4 py-5 text-sm leading-6 text-[#4B5563]">
                No chats yet. Start a new conversation and it will appear here.
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

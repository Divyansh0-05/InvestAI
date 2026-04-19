"use client";

import Link from "next/link";
import { Plus, X, Trash2 } from "lucide-react";

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
        className={`fixed bottom-0 left-0 z-40 flex w-full flex-col rounded-t-3xl border-t border-[#E2F0E8] bg-white md:static md:h-auto md:w-[260px] md:rounded-none md:border-r md:border-t-0 transition-transform ${
          isOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"
        }`}
        style={{
          height: isOpen ? "85vh" : "auto",
        }}
      >
        <div className="border-b border-[#E2F0E8] px-4 pb-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-green-700">
              investAI 🤝
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
          >
            <Plus className="h-5 w-5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="animate-pulse rounded-xl border border-transparent bg-gray-100 px-3 py-3"
                >
                  <div className="h-4 w-3/4 rounded-full bg-gray-200" />
                  <div className="mt-2 h-3 w-1/3 rounded-full bg-gray-150" />
                </div>
              ))
            ) : sessions.length > 0 ? (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;

                return (
                  <div
                    key={session.id}
                    className={`group w-full rounded-xl border px-3 py-2.5 text-left transition ${
                      isActive
                        ? "border-green-200 bg-green-50"
                        : "border-transparent bg-white hover:bg-green-50"
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
                        <p className="truncate text-sm font-medium text-gray-700">
                          {truncateTitle(session.title || "New Chat")}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {formatTimeAgo(session.updated_at)}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSession(session.id)}
                        className="rounded-lg p-1.5 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                        aria-label={`Delete ${session.title || "chat session"}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-[#E2F0E8] bg-[#F7FDF9] px-4 py-5 text-sm leading-6 text-gray-500">
                No chats yet. Start a new conversation and it will appear here.
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

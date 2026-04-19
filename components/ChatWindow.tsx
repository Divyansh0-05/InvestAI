"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Menu, Send, LogOut, Bell, Check } from "lucide-react";
import { useLang } from "@/context/LangContext";
import LangSwitcher from "@/components/LangSwitcher";
import PhotoUpload from "@/components/PhotoUpload";
import VoiceInput from "@/components/VoiceInput";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type DatabaseMessage = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type ReminderPayload = {
  message: string;
  date: string;
};

type ChatWindowProps = {
  sessionId: string | null;
  sessionTitle: string | null;
  onSessionCreate: (sessionId: string, title: string) => void;
  onSessionUpdate: (sessionId: string, title: string) => void;
  onOpenSidebar: () => void;
};

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full bg-green-600 animate-dot" />
      <span className="h-2 w-2 rounded-full bg-green-600 animate-dot" style={{ animationDelay: "0.2s" }} />
      <span className="h-2 w-2 rounded-full bg-green-600 animate-dot" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}

function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-gray-800 prose-p:my-0 prose-p:leading-6 prose-strong:text-[#111827] prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-li:marker:text-green-600">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol className="my-2 list-decimal pl-5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function formatTimestamp(value?: string) {
  const date = value ? new Date(value) : new Date();

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatWindow({
  sessionId,
  sessionTitle,
  onSessionCreate,
  onSessionUpdate,
  onOpenSidebar,
}: ChatWindowProps) {
  const { lang } = useLang();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSessionLoadRef = useRef<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setActiveSessionId(sessionId);
  }, [sessionId]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isMounted) {
        setUserEmail(session?.user.email ?? "");
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? "");
    });

    void loadSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    async function loadMessagesForSession() {
      if (!sessionId) {
        setMessages([]);
        return;
      }

      if (skipNextSessionLoadRef.current === sessionId) {
        skipNextSessionLoadRef.current = null;
        return;
      }

      const { data, error } = await supabase
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (!isMounted || error) {
        return;
      }

      setMessages(
        (data as DatabaseMessage[]).map((message) => ({
          role: message.role,
          content: message.content,
          timestamp: formatTimestamp(message.created_at),
        })),
      );
    }

    void loadMessagesForSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId, supabase]);

  function handlePhotoResult(text: string) {
    setMessages((current) => [
      ...current,
      { role: "assistant", content: text, timestamp: formatTimestamp() },
    ]);
  }

  function handleTranscript(text: string) {
    setInputText(text);
  }

  function showReminderToast() {
    setShowToast(true);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }

  async function processReminder(text: string) {
    const match = text.match(/\[REMINDER:({.*?})\]/);
    const cleanText = text.replace(/\n?\[REMINDER:({.*?})\]/, "").trim();

    if (!match) {
      return cleanText;
    }

    try {
      const reminder = JSON.parse(match[1]) as ReminderPayload;

      if (reminder.message && reminder.date) {
        await fetch("/api/reminder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: reminder.message,
            reminder_date: reminder.date,
          }),
        });
        showReminderToast();
      }
    } catch {
      return cleanText;
    }

    return cleanText;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const history = messages;
    const timestamp = formatTimestamp();
    const userMessage: Message = {
      role: "user",
      content: trimmedInput,
      timestamp,
    };
    const optimisticAssistantTimestamp = formatTimestamp();

    setMessages((current) => [
      ...current,
      userMessage,
      { role: "assistant", content: "", timestamp: optimisticAssistantTimestamp },
    ]);
    setInputText("");
    setIsLoading(true);

    try {
      let workingSessionId = activeSessionId;

      if (!workingSessionId) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error(userError?.message ?? "Please login again.");
        }

        const title = trimmedInput.slice(0, 40) || "New Chat";
        const { data: newSession, error: sessionError } = await supabase
          .from("chat_sessions")
          .insert({
            user_id: user.id,
            title,
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (sessionError || !newSession) {
          throw new Error(sessionError?.message ?? "Failed to create chat session.");
        }

        workingSessionId = newSession.id as string;
        skipNextSessionLoadRef.current = workingSessionId;
        setActiveSessionId(workingSessionId);
        onSessionCreate(workingSessionId, title);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedInput,
          lang,
          history,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong. Please try again.";

        try {
          const errorData = (await response.json()) as { error?: string };
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          errorMessage = "Something went wrong. Please try again.";
        }

        setMessages((current) => {
          const updated = [...current];
          updated[updated.length - 1] = {
            role: "assistant",
            content: errorMessage,
            timestamp: formatTimestamp(),
          };
          return updated;
        });
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream received.");
      }

      const decoder = new TextDecoder();
      let done = false;
      let assistantMessage = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          if (chunk) {
            assistantMessage += chunk;
            setMessages((current) => {
              const updated = [...current];
              const lastMessage = updated[updated.length - 1];

              if (lastMessage?.role === "assistant") {
                updated[updated.length - 1] = {
                  ...lastMessage,
                  content: lastMessage.content + chunk,
                };
              }

              return updated;
            });
          }
        }
      }

      const cleanMessage = await processReminder(assistantMessage);

      setMessages((current) => {
        const updated = [...current];
        const lastMessage = updated[updated.length - 1];

        if (lastMessage?.role === "assistant") {
          updated[updated.length - 1] = {
            ...lastMessage,
            content: cleanMessage,
          };
        }

        return updated;
      });

      if (workingSessionId) {
        const { error: saveError } = await supabase.from("chat_messages").insert([
          {
            session_id: workingSessionId,
            role: "user",
            content: trimmedInput,
          },
          {
            session_id: workingSessionId,
            role: "assistant",
            content: cleanMessage,
          },
        ]);

        if (saveError) {
          throw new Error(saveError.message);
        }

        const nextTitle =
          sessionTitle && sessionTitle !== "New Chat"
            ? sessionTitle
            : trimmedInput.slice(0, 40) || "New Chat";
        const { error: updateError } = await supabase
          .from("chat_sessions")
          .update({
            title: nextTitle,
            updated_at: new Date().toISOString(),
          })
          .eq("id", workingSessionId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        onSessionUpdate(workingSessionId, nextTitle);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";

      setMessages((current) => {
        const updated = [...current];
        updated[updated.length - 1] = {
          role: "assistant",
          content: errorMessage,
          timestamp: formatTimestamp(),
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#F9FAFB]">
      <header className="sticky top-0 z-10 px-0 text-white">
        <div
          className="w-full bg-gradient-to-r from-green-700 to-green-600 px-4 py-4 shadow-[0_2px_12px_rgba(22,163,74,0.15)]"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={onOpenSidebar}
                className="mt-0.5 rounded-lg p-2 text-white transition hover:bg-white/10 md:hidden"
                aria-label="Open chat history"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <Link
                  href="/"
                  className="block font-['Plus_Jakarta_Sans'] text-lg font-bold text-white"
                >
                  investAI 🤝
                </Link>
                <p className="mt-0.5 text-xs text-white/70">Aapka financial dost</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <LangSwitcher />
              <div className="text-right text-xs">
                {userEmail ? <p className="text-white/70 truncate max-w-[100px]">{userEmail}</p> : null}
                <div className="mt-1 flex items-center justify-end gap-2">
                  <Link href="/reminders" className="inline-flex items-center gap-1 font-medium text-white transition hover:text-green-100" title="Reminders">
                    <Bell className="h-4 w-4" />
                    <span className="hidden sm:inline">Reminders</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="inline-flex items-center gap-1 font-medium text-white transition hover:text-green-100" title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-5 pb-28 md:px-5 bg-[#F7FDF9]">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-[#E2F0E8] bg-white px-4 py-4 text-sm leading-6 text-green-700 shadow-[0_2px_12px_rgba(22,163,74,0.08)]">
              Namaste! Apna sawaal poochho, main simple language mein help karoonga.
            </div>
          ) : null}

          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const isStreamingAssistant =
              !isUser &&
              isLoading &&
              index === messages.length - 1 &&
              message.content.length === 0;

            return (
              <div
                key={`${message.role}-${index}`}
                className={`flex animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}
              >
                {isUser ? (
                  <div className="max-w-[85%]">
                    <div className="rounded-2xl rounded-br-none bg-green-600 px-4 py-2.5 text-sm leading-6 text-white shadow-[0_2px_12px_rgba(22,163,74,0.08)]">
                      {isStreamingAssistant ? <LoadingDots /> : message.content}
                    </div>
                    <p className="mt-1 px-1 text-right text-[10px] text-[#6B7280]">
                      {message.timestamp}
                    </p>
                  </div>
                ) : (
                  <div className="max-w-[85%]">
                    <p className="mb-1 flex items-center gap-1 px-1 text-[10px] font-semibold text-green-700">
                      investAI 🤝
                    </p>
                    <div className="rounded-2xl rounded-bl-none border border-[#E2F0E8] bg-white px-4 py-2.5 text-sm leading-6 text-gray-800 shadow-[0_2px_12px_rgba(22,163,74,0.08)]">
                      {isStreamingAssistant ? <LoadingDots /> : <AssistantMessage content={message.content} />}
                    </div>
                    <p className="mt-1 px-1 text-left text-[10px] text-[#6B7280]">{message.timestamp}</p>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 border-t border-[#E2F0E8] bg-white/95 backdrop-blur px-3 py-3"
      >
        {showToast ? (
          <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 shadow-sm flex items-center gap-2">
            <Check className="h-4 w-4" />
            Reminder save ho gaya!
          </div>
        ) : null}
        <div className="mx-auto flex w-full max-w-4xl items-center gap-2 rounded-full border border-[#E2F0E8] bg-[#F7FDF9] p-1.5 shadow-sm">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Apna sawaal poochho..."
            disabled={isLoading}
            className="flex-1 rounded-full border-0 bg-transparent px-5 py-2.5 text-sm text-[#111827] outline-none placeholder:text-gray-400"
          />
          <VoiceInput onTranscript={handleTranscript} />
          <PhotoUpload lang={lang} onResult={handlePhotoResult} />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300 shadow-sm"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

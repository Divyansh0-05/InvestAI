"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LangContext";
import LangSwitcher from "@/components/LangSwitcher";
import PhotoUpload from "@/components/PhotoUpload";
import VoiceInput from "@/components/VoiceInput";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type ReminderPayload = {
  message: string;
  date: string;
};

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:0.15s]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:0.3s]" />
    </div>
  );
}

export default function ChatWindow() {
  const { lang } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  function getTimestamp() {
    return new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handlePhotoResult(text: string) {
    setMessages((current) => [
      ...current,
      { role: "assistant", content: text, timestamp: getTimestamp() },
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
    const timestamp = getTimestamp();
    const userMessage: Message = {
      role: "user",
      content: trimmedInput,
      timestamp,
    };

    setMessages((current) => [
      ...current,
      userMessage,
      { role: "assistant", content: "", timestamp: getTimestamp() },
    ]);
    setInputText("");
    setIsLoading(true);

    try {
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
            timestamp: getTimestamp(),
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";

      setMessages((current) => {
        const updated = [...current];
        updated[updated.length - 1] = {
          role: "assistant",
          content: errorMessage,
          timestamp: getTimestamp(),
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[#F9FAFB]">
      <header className="sticky top-0 z-10 px-0 pb-2 text-white">
        <div
          className="mx-auto w-full max-w-[480px] rounded-b-[28px] bg-gradient-to-r from-green-700 to-green-500 px-4 pb-4 pt-4 shadow-[0_12px_40px_rgba(22,163,74,0.28)]"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link href="/" className="block font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">
                investAI {"\u{1F91D}"}
              </Link>
              <p className="mt-1 text-xs text-white/80">Aapka financial dost</p>
            </div>
            <LangSwitcher />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-5 pb-28">
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="rounded-3xl border border-[#dcfce7] bg-[#F0FDF4] px-4 py-4 text-sm leading-6 text-[#166534] shadow-sm">
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
                    <div className="rounded-2xl rounded-tr-sm bg-green-600 px-4 py-3 text-sm leading-6 text-white shadow-sm">
                      {isStreamingAssistant ? <LoadingDots /> : message.content}
                    </div>
                    <p className="mt-1 px-1 text-right text-[11px] text-[#6B7280]">
                      {message.timestamp}
                    </p>
                  </div>
                ) : (
                  <div className="max-w-[85%]">
                    <p className="mb-1 flex items-center gap-1 px-1 text-[11px] font-medium text-green-700">
                      <span>{"\u{1F91D}"}</span>
                      <span>Saathi</span>
                    </p>
                    <div className="rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3 text-sm leading-6 text-gray-800 shadow-sm">
                      {isStreamingAssistant ? <LoadingDots /> : message.content}
                    </div>
                    <p className="mt-1 px-1 text-[11px] text-[#6B7280]">{message.timestamp}</p>
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
        className="sticky bottom-0 border-t border-gray-200 bg-white/90 px-3 py-3 backdrop-blur-sm"
      >
        {showToast ? (
          <div className="mb-3 rounded-xl border border-green-200 bg-[#dcfce7] px-4 py-2 text-sm font-medium text-[#166534] shadow-sm">
            {"\u2713"} Reminder save ho gaya!
          </div>
        ) : null}
        <div className="flex items-center gap-2 rounded-[28px] border border-[#E5E7EB] bg-white p-2 shadow-sm">
          <input
            type="text"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder={`Apna sawaal poochho... ${"\u{1F4AC}"}`}
            disabled={isLoading}
            className="flex-1 rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-green-500"
          />
          <VoiceInput onTranscript={handleTranscript} />
          <PhotoUpload lang={lang} onResult={handlePhotoResult} />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-lg text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            {"\u27A4"}
          </button>
        </div>
      </form>
    </div>
  );
}

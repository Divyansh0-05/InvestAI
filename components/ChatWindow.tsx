"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatWindowProps = {
  lang: string;
};

function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
    </div>
  );
}

export default function ChatWindow({ lang }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const history = messages;
    const userMessage: Message = { role: "user", content: trimmedInput };

    setMessages((current) => [
      ...current,
      userMessage,
      { role: "assistant", content: "" },
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

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          if (chunk) {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";

      setMessages((current) => {
        const updated = [...current];
        updated[updated.length - 1] = {
          role: "assistant",
          content: errorMessage,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[#efeae2]">
      <header className="sticky top-0 z-10 bg-[#25D366] px-4 py-4 text-white shadow-sm">
        <h1 className="text-lg font-semibold">Saathi</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 pb-28">
        <div className="flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
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
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={[
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
                    isUser
                      ? "rounded-br-md bg-[#25D366] text-white"
                      : "rounded-bl-md bg-white text-slate-800",
                  ].join(" ")}
                >
                  {isStreamingAssistant ? <LoadingDots /> : message.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 border-t border-black/5 bg-[#f7f3ee] px-3 py-3"
      >
        <div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-sm">
          <input
            type="text"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Apna sawaal poochho..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-lg text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            {">"}
          </button>
        </div>
      </form>
    </div>
  );
}

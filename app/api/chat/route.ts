import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const systemInstruction =
  "You are Saathi, a friendly financial assistant for rural and semi-urban Indians. " +
  "Always respond in the same language the user writes in. If they write in Hindi or " +
  "Hinglish (Hindi mixed with English), respond in Hinglish. Keep responses short, " +
  "warm, and avoid financial jargon. When recommending FDs, always mention bank name, " +
  "rate, and trust score. End every financial suggestion with: 'Ye sirf suggestions " +
  "hain - apne bank se zaroor confirm karein.'";

type HistoryMessage = {
  role: string;
  content: string;
};

type ChatRequestBody = {
  message: string;
  lang: string;
  history: HistoryMessage[];
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Failed to generate chat response.";
}

export async function POST(request: Request) {
  try {
    const { message, lang, history } = (await request.json()) as ChatRequestBody;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction,
    });

    const chat = model.startChat({
      systemInstruction,
      history: Array.isArray(history)
        ? history.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }))
        : [],
    });

    const prompt =
      typeof lang === "string" && lang.trim()
        ? `User language preference: ${lang}\n\n${message}`
        : message;

    const result = await chat.sendMessageStream(prompt);
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Gemini stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const message = getErrorMessage(error);

    return Response.json({ error: message }, { status: 500 });
  }
}

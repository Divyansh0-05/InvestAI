import { GoogleGenerativeAI, type Content } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

function getSystemInstruction(lang?: string): Content {
  const baseInstruction =
    "You are investAI, a friendly financial assistant for rural and semi-urban Indians. " +
    "Keep responses short, warm, and avoid financial jargon. When recommending FDs, always mention bank name, " +
    "rate, and trust score. End every financial suggestion with a reminder to confirm with the bank. " +
    "When the user asks for a reminder (words like 'yaad dilao', 'remind me', " +
    "'reminder chahiye'), extract the reminder text and date. At the very end of " +
    "your response, append this exact format on a new line: " +
    '[REMINDER:{"message":"reminder text here","date":"YYYY-MM-DD"}] ' +
    "Only add this if the user explicitly asked for a reminder.";

  let languageInstruction = "";

  // Add language-specific instruction based on user preference
  if (lang?.toLowerCase().includes("hindi")) {
    languageInstruction =
      "Always respond in pure Hindi (Devanagari script). Use simple, everyday Hindi words. " +
      "For the bank reminder, use: 'Ye sirf sujhaav hain - zaroor apne bank se pooch le.'";
  } else if (lang?.toLowerCase().includes("hinglish") || lang?.toLowerCase().includes("english")) {
    languageInstruction =
      "Always respond in Hinglish (Hindi mixed with English, using Roman script). Use simple everyday language. " +
      "For the bank reminder, use: 'Ye sirf suggestions hain - apne bank se zaroor confirm karein.'";
  } else if (lang?.toLowerCase().includes("bhojpuri")) {
    languageInstruction =
      "Always respond in Bhojpuri language. Use simple Bhojpuri words and phrases. " +
      "For the bank reminder, use appropriate Bhojpuri phrasing.";
  } else if (lang?.toLowerCase().includes("punjabi")) {
    languageInstruction =
      "Always respond in Punjabi language. Use simple, everyday Punjabi words. " +
      "For the bank reminder, use appropriate Punjabi phrasing.";
  } else {
    // Default to Hinglish
    languageInstruction =
      "Always respond in Hinglish (Hindi mixed with English, using Roman script). " +
      "Use simple, everyday language. " +
      "For the bank reminder, use: 'Ye sirf suggestions hain - apne bank se zaroor confirm karein.'";
  }

  return {
    role: "system",
    parts: [
      {
        text: baseInstruction + " " + languageInstruction,
      },
    ],
  };
}

type HistoryMessage = {
  role: string;
  content: string;
};

type ChatRequestBody = {
  message: string;
  lang: string;
  history: HistoryMessage[];
};

function normalizeHistory(history: HistoryMessage[]) {
  const mappedHistory = history
    .filter(
      (message): message is HistoryMessage =>
        Boolean(message) &&
        typeof message.content === "string" &&
        message.content.trim().length > 0 &&
        (message.role === "user" || message.role === "assistant"),
    )
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

  const firstUserIndex = mappedHistory.findIndex((message) => message.role === "user");
  return firstUserIndex === -1 ? [] : mappedHistory.slice(firstUserIndex);
}

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
      systemInstruction: getSystemInstruction(lang),
    });

    const chat = model.startChat({
      history: Array.isArray(history) ? normalizeHistory(history) : [],
    });

    const prompt = message;

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

    if (message.includes("429") || message.includes("quota") || message.includes("Too Many Requests")) {
      return Response.json({ error: "AI quota exceeded. Please try again later or upgrade your plan." }, { status: 429 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}

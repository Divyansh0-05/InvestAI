import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type VisionJsonBody = {
  image?: string;
  mimeType?: string;
  lang?: string;
};

function buildPrompt(lang: string) {
  return (
    "This is a photo of an FD receipt or bank document from India. " +
    "Extract these details if visible: bank name, deposit amount, interest rate, " +
    "tenure, maturity date, maturity amount. " +
    `Respond in ${lang}. Use simple language. Format as a clean summary. ` +
    "If something is not readable, say 'Yeh part clear nahi tha'."
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VisionJsonBody;

    if (!body.image) {
      return Response.json({ error: "Image is required." }, { status: 400 });
    }

    const lang =
      typeof body.lang === "string" && body.lang.trim() ? body.lang : "Hinglish";
    const mimeType =
      typeof body.mimeType === "string" && body.mimeType.trim()
        ? body.mimeType
        : "image/jpeg";

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: buildPrompt(lang) },
            {
              inlineData: {
                data: body.image,
                mimeType,
              },
            },
          ],
        },
      ],
    });

    return Response.json({ result: result.response.text() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process image.";

    return Response.json({ error: message }, { status: 500 });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-2.5-flash-lite";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const receiptPrompt =
  "Read this FD receipt carefully. Extract the key details and explain them simply. " +
  "Return the bank name, customer name if visible, deposit amount, interest rate, tenure, " +
  "maturity amount, maturity date, and any notable terms or warnings. If a field is unclear, say so.";

type VisionJsonBody = {
  image?: string;
  mimeType?: string;
  prompt?: string;
};

async function getImageFromRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return null;
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    return {
      data: buffer.toString("base64"),
      mimeType: file.type || "image/jpeg",
      prompt:
        typeof formData.get("prompt") === "string"
          ? String(formData.get("prompt"))
          : receiptPrompt,
    };
  }

  const body = (await request.json()) as VisionJsonBody;

  if (!body?.image) {
    return null;
  }

  return {
    data: body.image,
    mimeType: body.mimeType || "image/jpeg",
    prompt: body.prompt || receiptPrompt,
  };
}

export async function POST(request: Request) {
  const image = await getImageFromRequest(request);

  if (!image) {
    return Response.json({ error: "Image is required." }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: image.prompt },
          {
            inlineData: {
              data: image.data,
              mimeType: image.mimeType,
            },
          },
        ],
      },
    ],
  });

  return Response.json({ text: result.response.text() });
}

import { readFile } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "banks.json");
    const fileContents = await readFile(filePath, "utf8");
    const banks = JSON.parse(fileContents);

    return Response.json(banks);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load bank data.";

    return Response.json({ error: message }, { status: 500 });
  }
}

import { supabase } from "@/lib/supabase";

type ReminderBody = {
  message?: string;
  reminder_date?: string;
};

export async function POST(request: Request) {
  try {
    const { message, reminder_date } = (await request.json()) as ReminderBody;

    if (!message || !reminder_date) {
      return Response.json(
        { error: "message and reminder_date are required." },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("reminders").insert({
      user_message: message,
      reminder_date,
    });

    if (error) {
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save reminder.";

    return Response.json({ error: message }, { status: 500 });
  }
}

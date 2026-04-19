import { createServerSupabaseClient } from "@/lib/supabase-server";

type ReminderBody = {
  message?: string;
  reminder_date?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { message, reminder_date } = (await request.json()) as ReminderBody;

    if (!message || !reminder_date) {
      return Response.json(
        { error: "message and reminder_date are required." },
        { status: 400 },
      );
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { error } = await supabase.from("reminders").insert({
      user_message: message,
      reminder_date,
      user_id: session.user.id,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save reminder.";

    return Response.json({ error: message }, { status: 500 });
  }
}

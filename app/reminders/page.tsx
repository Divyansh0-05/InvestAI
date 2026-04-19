import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type Reminder = {
  id: string;
  user_message: string;
  reminder_date: string;
};

function formatReminderDate(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export default async function RemindersPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/auth");
  }

  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("id, user_message, reminder_date")
    .eq("user_id", session.user.id)
    .order("reminder_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="min-h-screen px-4 py-6 text-[#111827]">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[32px] bg-gradient-to-r from-green-700 to-green-500 px-6 py-6 text-white shadow-[0_18px_48px_rgba(22,163,74,0.24)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
                investAI
              </p>
              <h1 className="mt-3 font-['Plus_Jakarta_Sans'] text-3xl font-bold">
                Your reminders
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">
                Yahan aap chat se save kiye hue reminders dekh sakte ho.
              </p>
            </div>
            <Link
              href="/chat"
              className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Back to chat
            </Link>
          </div>
        </div>

        <section className="mt-6 rounded-[28px] border border-[#dcfce7] bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          {reminders && reminders.length > 0 ? (
            <div className="space-y-4">
              {reminders.map((reminder: Reminder) => (
                <article
                  key={reminder.id}
                  className="rounded-3xl border border-[#E5E7EB] bg-[#F9FAFB] p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-base font-semibold text-[#111827]">
                      {reminder.user_message}
                    </p>
                    <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#166534]">
                      {formatReminderDate(reminder.reminder_date)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#BBF7D0] bg-[#F0FDF4] px-5 py-8 text-center">
              <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#166534]">
                No reminders yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#4B5563]">
                Chat mein bolo something like “remind me tomorrow to pay electricity bill”, and
                it will show up here.
              </p>
              <Link
                href="/chat"
                className="mt-4 inline-flex rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Create a reminder
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";
import { readSession, updateSession } from "@/lib/session";
import { submitSession } from "@/server/held.functions";

export const Route = createFileRoute("/reflect")({
  component: Reflect,
});

function Reflect() {
  const navigate = useNavigate();
  const [text, setText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const s = readSession();
    if (s.reactions.length === 0) navigate({ to: "/" });
  }, [navigate]);

  const finish = async (reflection: string) => {
    if (submitting) return;
    setSubmitting(true);
    const s = updateSession((cur) => ({ ...cur, reflection }));
    try {
      const { token } = await submitSession({
        data: {
          onboarding: s.onboarding,
          reactions: s.reactions,
          reflection,
        },
      });
      updateSession((cur) => ({ ...cur, token }));
      navigate({ to: "/result/$token", params: { token } });
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <h2 className="font-serif text-3xl leading-snug text-foreground">
        one last thing — only if you want.
      </h2>
      <p className="mt-3 text-base text-muted-foreground">
        What's one thing you carry that wasn't on any card?
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Or skip — it's okay."
        rows={6}
        className="mt-8 w-full resize-none rounded-md border border-border bg-card p-4 font-serif text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
      />

      <div className="mt-10 flex items-center gap-6">
        <button
          onClick={() => finish(text)}
          disabled={submitting}
          className="rounded-md bg-foreground px-8 py-3 font-serif text-lg text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? "loading…" : "see what came up"}
        </button>
        <button
          onClick={() => finish("")}
          disabled={submitting}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          skip
        </button>
      </div>
    </Shell>
  );
}

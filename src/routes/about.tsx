import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";
import { subscribeEmail } from "@/server/held.functions";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "about — held." },
      {
        name: "description",
        content:
          "expat berlin parents building a quiet support system for the invisible load.",
      },
      { property: "og:title", content: "about — held." },
      {
        property: "og:description",
        content:
          "expat berlin parents building a quiet support system for the invisible load.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Shell>
      <h1 className="font-serif text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl">
        we're a family of five trying to understand{" "}
        <span className="ink-accent italic underline-hand">what it takes</span>.
      </h1>

      <Section eyebrow="who">
        expats in berlin, both working parents, three kids — 4, 8, and 12.
        twelve years in the city. we've lived it all with them from birth
        toward teenage years (almost there). we know, in our bones, what it
        takes to raise kids in germany — and in a big city specifically.
      </Section>

      <Section eyebrow="why">
        we're on a mission to recognise the effort and the strength it takes.
        and, based on everything we've lived, to build a help system that
        anticipates and supports.
      </Section>

      <p className="mt-6 font-serif text-lg italic leading-relaxed text-muted-foreground">
        not a planner. not a to-do list. not a calendar.
      </p>

      <Section eyebrow="your data">
        held is anonymous. we never share or sell your answers. the patterns
        we see are used only to build a more meaningful product for parents
        like us. full details:{" "}
        <Link
          to="/privacy"
          className="ink-accent underline-offset-4 hover:underline"
        >
          privacy
        </Link>
        .
      </Section>

      <Section eyebrow="what's next">
        right now held shows you the load. next, it starts to hold some of it
        — quietly, over time. leave your email to be there when it does.
      </Section>

      <EmailCapture />
    </Shell>
  );
}

function Section({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-border/60 pt-8">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <p className="mt-4 text-base leading-relaxed text-foreground/80">
        {children}
      </p>
    </section>
  );
}

function EmailCapture() {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || !email.trim()) return;
    setState("loading");
    try {
      await subscribeEmail({ data: { email: email.trim(), source: "about" } });
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="mt-8 rounded-2xl border border-border bg-card px-6 py-8 text-center shadow-sm sm:px-8">
        <p className="font-serif text-3xl leading-none text-muted-foreground/40" aria-hidden>
          ✓
        </p>
        <p className="mt-3 font-serif text-lg italic leading-snug text-foreground">
          thank you.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          we'll be in touch when there's something worth saying.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your email"
          className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-foreground/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-md bg-foreground px-6 py-3 font-serif text-base text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {state === "loading" ? "…" : "keep me posted"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-muted-foreground">
          something went wrong — try again?
        </p>
      )}
    </form>
  );
}

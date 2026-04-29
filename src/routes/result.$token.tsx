import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";
import { getResult, submitCoping } from "@/server/held.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/result/$token")({
  loader: async ({ params }) => {
    return await getResult({ data: { token: params.token } });
  },
  head: ({ loaderData }) => {
    const top = loaderData?.top_categories ?? [];
    const desc = top.length
      ? `Most of what you carry is the ${categoryLabel(top[0])}.`
      : "A quiet two minutes about the invisible part of parenting.";
    return {
      meta: [
        { title: "what you carry — held" },
        { name: "description", content: desc },
        { property: "og:title", content: "what you carry — held" },
        { property: "og:description", content: desc },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <Shell>
      <p className="font-serif text-xl text-foreground">we couldn't find that page.</p>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      <Link to="/" className="mt-8 text-sm text-foreground underline underline-offset-4">
        start over
      </Link>
    </Shell>
  ),
  component: Result,
});

function categoryLabel(c: string): string {
  switch (c) {
    case "noticing":
      return "noticing — the small things no one else sees coming";
    case "anticipating":
      return "anticipating — running ahead of what hasn't happened yet";
    case "remembering":
      return "remembering — holding details no one else holds";
    case "soothing":
      return "soothing — being the soft place when no one is soft for you";
    case "mediating":
      return "mediating — translating between people who don't realize you're translating";
    case "logistics":
      return "logistics — being the default when there is no default";
    case "identity-loss":
      return "the quiet loss of who you were before";
    case "invisible-decisions":
      return "the small invisible decisions you've already made today";
    default:
      return c;
  }
}

function shortLabel(c: string): string {
  return categoryLabel(c).split(" — ")[0];
}

function Result() {
  const { token } = Route.useParams();
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);
  const [showCoping, setShowCoping] = React.useState(false);

  const top = data.top_categories;
  const headline =
    top.length > 0
      ? `most of what you carry is the ${shortLabel(top[0])} —`
      : "you showed up. that already counts.";
  const sub =
    top.length > 0
      ? top[0] === "noticing"
        ? "the small things no one else sees coming."
        : top[0] === "remembering"
          ? "the details no one else is holding."
          : top[0] === "anticipating"
            ? "everything that hasn't happened yet."
            : top[0] === "soothing"
              ? "being soft when no one is soft for you."
              : top[0] === "logistics"
                ? "being the default when there is no default."
                : top[0] === "identity-loss"
                  ? "and underneath, who you were before."
                  : top[0] === "mediating"
                    ? "translating between people who don't know you're translating."
                    : "the quiet decisions you've already made today."
      : "";

  const share = async () => {
    const url = `${window.location.origin}/r/${token}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "held", url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      /* ignore */
    }
  };

  return (
    <Shell>
      <h2 className="font-serif text-3xl leading-[1.2] tracking-tight text-foreground sm:text-4xl">
        {headline}
      </h2>
      {sub && (
        <p className="mt-3 font-serif text-2xl leading-snug text-muted-foreground">{sub}</p>
      )}

      {top.length > 1 && (
        <div className="mt-10 space-y-2 border-t border-border pt-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            also showing up
          </p>
          {top.slice(1).map((c) => (
            <p key={c} className="font-serif text-lg text-foreground">
              {shortLabel(c)}
            </p>
          ))}
        </div>
      )}

      <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
        you're not the only one. {data.parents_this_week.toLocaleString()} parents
        {data.parents_this_week === 1 ? " has" : " have"} sat with these cards this week.
      </p>

      <div className="mt-12 space-y-3">
        <button
          onClick={share}
          className="w-full rounded-md bg-foreground px-6 py-3 font-serif text-lg text-background transition-opacity hover:opacity-90"
        >
          {copied ? "link copied" : "send this to someone who'd get it"}
        </button>
        <button
          onClick={() => setShowCoping((v) => !v)}
          className="w-full rounded-md border border-border bg-transparent px-6 py-3 font-serif text-lg text-foreground transition-colors hover:bg-muted"
        >
          {showCoping ? "close" : "one more — what helps you cope?"}
        </button>
      </div>

      {showCoping && (
        <CopingForm
          token={token}
          onDone={() => {
            setShowCoping(false);
          }}
        />
      )}

      <button
        onClick={() => navigate({ to: "/" })}
        className="mt-12 self-start text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        start again
      </button>
    </Shell>
  );
}

const CHIPS = [
  "talking to a friend",
  "time alone",
  "scrolling",
  "nothing really works right now",
];

function CopingForm({ token, onDone }: { token: string; onDone: () => void }) {
  const [text, setText] = React.useState("");
  const [chips, setChips] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const toggle = (c: string) =>
    setChips((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitCoping({ data: { token, text, chips } });
      setDone(true);
      setTimeout(onDone, 1800);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <p className="mt-8 font-serif text-lg text-muted-foreground">
        thank you. that helps more than you know.
      </p>
    );
  }

  return (
    <div className="mt-8 border-t border-border pt-8">
      <p className="font-serif text-lg leading-snug text-foreground">
        when the load gets heavy, what actually helps you cope right now?
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => toggle(c)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-all",
              chips.includes(c)
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:border-foreground/50",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="or in your own words…"
        rows={3}
        className="mt-4 w-full resize-none rounded-md border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={submitting}
        className="mt-4 rounded-md bg-foreground px-6 py-2 font-serif text-base text-background transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {submitting ? "…" : "send"}
      </button>
    </div>
  );
}

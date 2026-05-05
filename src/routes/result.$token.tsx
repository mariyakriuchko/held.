import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Shell } from "@/components/held/Shell";
import { getResult, subscribeEmail } from "@/server/held.functions";

export const Route = createFileRoute("/result/$token")({
  loader: async ({ params }) => {
    return await getResult({ data: { token: params.token } });
  },
  head: ({ loaderData }) => {
    const desc =
      loaderData?.headline ??
      (loaderData?.top_categories?.length
        ? `most of what came up is ${categoryShort(loaderData.top_categories[0])}.`
        : "two minutes on the invisible part of parenting.");
    return {
      meta: [
        { title: "here's what came up — held" },
        { name: "description", content: desc },
        { property: "og:title", content: "here's what came up — held" },
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

function categoryShort(c: string): string {
  switch (c) {
    case "school_comm":
      return "the school messages";
    case "deadlines_prep":
      return "the deadlines and the prep";
    case "appointments":
      return "the appointments slipping out of view";
    case "social_obligations":
      return "the unwritten social obligations";
    case "daily_logistics":
      return "the small daily logistics";
    default:
      return c;
  }
}

// Templated fallback when AI headline isn't available.
function fallbackHeadline(
  top: string | undefined,
  sev: "critical" | "medium" | "light" | undefined,
): string {
  if (!top) return "you're the one keeping track of what no one else sees.";
  const cat = categoryShort(top);
  if (sev === "critical")
    return `you're a step ahead on ${cat} — the kind of tracking no one else notices until it slips.`;
  if (sev === "light")
    return `you're holding ${cat} in your head — the small, invisible stuff that only you keep ahead of.`;
  return `you're a step ahead on ${cat} — the steady, invisible tracking no one else is doing.`;
}

function Result() {
  const { token } = Route.useParams();
  const data = Route.useLoaderData();
  const navigate = useNavigate();

  const headline =
    data.headline ?? fallbackHeadline(data.top_categories[0], data.dominant_severity);
  const top = data.top_categories;

  const hasDetails =
    data.severity_counts.critical +
      data.severity_counts.medium +
      data.severity_counts.light >
      0 ||
    top.length > 1 ||
    (data.top_card_comparison && data.top_card_comparison.also_flagged >= 1);

  return (
    <Shell>
      {/* Headline card — the moment */}
      <div className="animate-headline-in rounded-2xl border border-border bg-card px-7 py-10 shadow-sm sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="font-serif text-3xl leading-none text-muted-foreground/40"
        >
          &ldquo;
        </div>
        <p className="mt-2 font-serif text-[1.35rem] italic leading-[1.45] tracking-tight text-foreground sm:text-[1.55rem]">
          {headline}
        </p>
        <p className="mt-8 text-right text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          — held
        </p>
      </div>

      {/* Unified CTA: share + email as one continuous block */}
      <ShareAndEmail token={token} headline={headline} />

      {/* Quiet expandable details */}
      {hasDetails && (
        <Collapsible className="mt-10">
          <CollapsibleTrigger className="group flex w-full items-center justify-between border-t border-border pt-5 text-left text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            <span>see what made up this picture</span>
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="space-y-8 pt-6">
              {data.severity_counts.critical +
                data.severity_counts.medium +
                data.severity_counts.light >
                0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    what it looks like for you
                  </p>
                  <SeverityBars counts={data.severity_counts} />
                </div>
              )}

              {top.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    and underneath that
                  </p>
                  {top.slice(1).map((c: string) => (
                    <p key={c} className="font-serif text-lg text-foreground">
                      {categoryShort(c)}
                    </p>
                  ))}
                </div>
              )}

              {data.top_card_comparison &&
                data.top_card_comparison.also_flagged >= 1 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      others carrying the same thing
                    </p>
                    <p className="mt-3 font-serif text-lg leading-snug text-foreground">
                      {data.top_card_comparison.also_flagged} out of the last{" "}
                      {data.top_card_comparison.sample_size} parents also flagged{" "}
                      <span className="italic text-muted-foreground">
                        "{data.top_card_comparison.scenario}"
                      </span>
                      .
                    </p>
                  </div>
                )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <p className="mt-12 text-sm leading-relaxed text-muted-foreground">
        {data.parents_this_week.toLocaleString()} parent
        {data.parents_this_week === 1 ? "" : "s"} sat with these cards this week.
      </p>

      <button
        onClick={() => navigate({ to: "/" })}
        className="mt-8 self-start text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        start again
      </button>
    </Shell>
  );
}

function ShareAndEmail({ token, headline }: { token: string; headline: string }) {
  const [copied, setCopied] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailState, setEmailState] = React.useState<
    "idle" | "loading" | "done" | "error"
  >("idle");

  const share = async () => {
    const url = `${window.location.origin}/r/${token}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "held", text: headline, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      /* ignore */
    }
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailState === "loading" || !email.trim()) return;
    setEmailState("loading");
    try {
      await subscribeEmail({
        data: { email: email.trim(), token, source: "result" },
      });
      setEmailState("done");
    } catch {
      setEmailState("error");
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <button
        onClick={share}
        className="w-full rounded-md bg-foreground px-6 py-3 font-serif text-base text-background transition-opacity hover:opacity-90"
      >
        {copied ? "link copied" : "send this to someone who'd get it"}
      </button>

      {emailState === "done" ? (
        <p className="text-sm text-muted-foreground">
          thank you. we'll be in touch when there's something worth saying.
        </p>
      ) : (
        <form onSubmit={submitEmail} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your email — for what comes next"
            className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-foreground/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={emailState === "loading"}
            className="rounded-md border border-border bg-transparent px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            {emailState === "loading" ? "…" : "keep me posted"}
          </button>
          {emailState === "error" && (
            <p className="text-xs text-muted-foreground">
              something went wrong — try again?
            </p>
          )}
        </form>
      )}
    </div>
  );
}

function SeverityBars({
  counts,
}: {
  counts: { critical: number; medium: number; light: number };
}) {
  const total = counts.critical + counts.medium + counts.light;
  const rows: Array<{ key: keyof typeof counts; label: string; count: number }> = [
    { key: "critical", label: "heavy", count: counts.critical },
    { key: "medium", label: "medium", count: counts.medium },
    { key: "light", label: "light", count: counts.light },
  ];
  return (
    <div className="mt-4 space-y-2">
      {rows.map((r) => {
        const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
        return (
          <div key={r.key} className="flex items-center gap-3">
            <span className="w-16 font-serif text-sm text-muted-foreground">
              {r.label}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 bg-foreground/80"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-8 text-right font-serif text-sm text-foreground">
              {r.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

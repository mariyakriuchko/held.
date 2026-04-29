import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { Shell } from "@/components/held/Shell";
import { cn } from "@/lib/utils";
import { getDeck } from "@/server/held.functions";
import { readSession, updateSession, type Reaction } from "@/lib/session";
import { ClusterMark } from "@/components/held/marks";

export const Route = createFileRoute("/cards")({
  component: Cards,
});

type Card = {
  id: string;
  category: string;
  scenario: string;
  severity: "critical" | "medium" | "light";
};

const REACTIONS: { value: Reaction; label: string }[] = [
  { value: "this_is_my_life", label: "happens in our house" },
  { value: "rarely", label: "rarely" },
  { value: "not_my_world", label: "not the case" },
];

function severityLabel(s: Card["severity"]): string {
  switch (s) {
    case "critical":
      return "the big slips";
    case "medium":
      return "happens often";
    case "light":
      return "the small stuff";
  }
}

function Cards() {
  const navigate = useNavigate();
  const [deck, setDeck] = React.useState<Card[] | null>(null);
  const [i, setI] = React.useState(0);
  const [weighs, setWeighs] = React.useState(false);
  const [fading, setFading] = React.useState(false);

  React.useEffect(() => {
    const s = readSession();
    // Allow even if onboarding fully skipped — onboarding is optional now.
    getDeck().then((d) => setDeck(d as Card[]));
    void s;
  }, [navigate]);

  if (!deck) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          loading…
        </div>
      </Shell>
    );
  }

  const card = deck[i];
  const total = deck.length;

  const advance = (reaction: Reaction) => {
    if (fading || !card) return;
    const entry = { card_id: card.id, reaction, weighs };
    updateSession((s) => ({ ...s, reactions: [...s.reactions, entry] }));
    setFading(true);
    setTimeout(() => {
      setWeighs(false);
      if (i + 1 >= total) {
        navigate({ to: "/reflect" });
      } else {
        setI(i + 1);
        setFading(false);
      }
    }, 280);
  };

  return (
    <Shell>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {i + 1} of {total}
          </span>
          <span className="uppercase tracking-wider">{severityLabel(card.severity)}</span>
        </div>

        <div className="flex flex-1 items-center">
          <div
            key={card?.id}
            className={cn(
              "w-full transition-opacity duration-300",
              fading ? "opacity-0" : "opacity-100",
            )}
          >
            {/* cluster mark — sits above the text, never behind */}
            <ClusterMark
              category={card.category}
              className="mb-6 h-8 w-8 text-foreground/40"
            />

            <p className="font-serif text-[28px] leading-[1.35] text-foreground sm:text-[32px] sm:leading-[1.3]">
              {card?.scenario}
            </p>
          </div>
        </div>

        {/* reactions + weighs toggle, all in one place */}
        <div
          className={cn(
            "mt-10 transition-opacity duration-300",
            fading ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="space-y-2">
            {REACTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => advance(r.value)}
                className="block w-full rounded-md border border-border bg-card px-5 py-4 text-left font-serif text-lg text-foreground transition-colors hover:border-foreground/50 hover:bg-muted"
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWeighs((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all",
                weighs
                  ? "ink-burgundy border-burgundy bg-burgundy/10"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
              aria-pressed={weighs}
              title="Tap if this one sticks with you"
            >
              <Bookmark
                size={14}
                strokeWidth={2}
                className={cn(weighs && "fill-current")}
              />
              {weighs ? "this one weighs" : "weighs on me"}
            </button>

            <button
              type="button"
              onClick={() => advance("skip")}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              skip
            </button>
          </div>

          {i === 0 && (
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              tap "weighs on me" if a card sticks with you — even if you also pick another answer.
            </p>
          )}
        </div>
      </div>
    </Shell>
  );
}

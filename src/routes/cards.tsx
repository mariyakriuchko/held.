import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bookmark, ChevronLeft } from "lucide-react";
import { Shell } from "@/components/held/Shell";
import { cn } from "@/lib/utils";
import { getDeck } from "@/server/held.functions";
import { readSession, updateSession, type Reaction } from "@/lib/session";

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

function Cards() {
  const navigate = useNavigate();
  const [deck, setDeck] = React.useState<Card[] | null>(null);
  const [i, setI] = React.useState(0);
  const [fading, setFading] = React.useState(false);

  React.useEffect(() => {
    const s = readSession();
    getDeck({
      data: {
        parent_role: s.onboarding.parent_role,
        age_bands: s.onboarding.age_bands,
      },
    }).then((d) => setDeck(d as Card[]));
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

  // Look up the existing answer for this card (so re-visiting shows what was picked).
  const session = readSession();
  const existing = session.reactions.find((r) => r.card_id === card.id);
  const currentReaction = existing?.reaction ?? null;
  const weighs = existing?.weighs ?? false;

  const setAnswer = (next: Partial<{ reaction: Reaction; weighs: boolean }>) => {
    updateSession((s) => {
      const others = s.reactions.filter((r) => r.card_id !== card.id);
      const merged = {
        card_id: card.id,
        reaction: next.reaction ?? currentReaction ?? "skip",
        weighs: next.weighs ?? weighs,
      };
      return { ...s, reactions: [...others, merged] };
    });
  };

  const goTo = (nextIndex: number) => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setI(nextIndex);
      setFading(false);
    }, 220);
  };

  const choose = (reaction: Reaction) => {
    setAnswer({ reaction });
    if (i + 1 >= total) {
      // small delay so the press registers visually
      setTimeout(() => navigate({ to: "/reflect" }), 180);
    } else {
      goTo(i + 1);
    }
  };

  const goBack = () => {
    if (i > 0) goTo(i - 1);
  };

  const goNext = () => {
    if (i + 1 >= total) {
      navigate({ to: "/reflect" });
    } else {
      goTo(i + 1);
    }
  };

  return (
    <Shell>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            onClick={goBack}
            disabled={i === 0}
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground disabled:invisible"
            aria-label="previous card"
          >
            <ChevronLeft size={14} />
            back
          </button>
          <span>
            {i + 1} of {total}
          </span>
        </div>

        <div className="flex flex-1 items-center">
          <div
            key={card?.id}
            className={cn(
              "w-full transition-opacity duration-200",
              fading ? "opacity-0" : "opacity-100",
            )}
          >
            <p className="font-serif text-[28px] leading-[1.35] text-foreground sm:text-[32px] sm:leading-[1.3]">
              {card?.scenario}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "mt-10 transition-opacity duration-240 delay-[120ms]",
            fading ? "opacity-0 delay-0" : "opacity-100",
          )}
        >
          <div className="space-y-1">
            {REACTIONS.map((r) => {
              const selected = currentReaction === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => choose(r.value)}
                  className={cn(
                    "group flex w-full items-center gap-3 py-3 text-left font-serif text-lg transition-colors",
                    selected
                      ? "text-foreground"
                      : "text-foreground/70 hover:text-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "inline-block h-2 w-2 shrink-0 rounded-full border transition-colors",
                      selected
                        ? "border-transparent bg-[var(--accent-ink)]"
                        : "border-foreground/30 group-hover:border-foreground/60",
                    )}
                  />
                  {r.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAnswer({ weighs: !weighs })}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-all",
                weighs
                  ? "ink-accent border-accent/40 bg-accent/10"
                  : "border-foreground/15 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
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

            {currentReaction ? (
              <button
                type="button"
                onClick={goNext}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {i + 1 >= total ? "that's all →" : "next →"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => choose("skip")}
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                skip
              </button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

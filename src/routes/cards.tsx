import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";
import { cn } from "@/lib/utils";
import { getDeck } from "@/server/held.functions";
import { readSession, updateSession, type Reaction } from "@/lib/session";

export const Route = createFileRoute("/cards")({
  component: Cards,
});

type Card = { id: string; category: string; scenario: string };

const REACTIONS: { value: Reaction; label: string }[] = [
  { value: "this_is_my_life", label: "this is my life" },
  { value: "rarely", label: "rarely" },
  { value: "not_my_world", label: "not my world" },
];

function Cards() {
  const navigate = useNavigate();
  const [deck, setDeck] = React.useState<Card[] | null>(null);
  const [i, setI] = React.useState(0);
  const [stings, setStings] = React.useState(false);
  const [fading, setFading] = React.useState(false);

  React.useEffect(() => {
    const s = readSession();
    if (!s.onboarding.parent_role) {
      navigate({ to: "/begin" });
      return;
    }
    getDeck().then((d) => setDeck(d as Card[]));
  }, [navigate]);

  if (!deck) {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          a moment…
        </div>
      </Shell>
    );
  }

  const card = deck[i];
  const total = deck.length;

  const choose = (reaction: Reaction) => {
    if (fading || !card) return;
    const entry = { card_id: card.id, reaction, stings };
    updateSession((s) => ({ ...s, reactions: [...s.reactions, entry] }));
    setFading(true);
    setTimeout(() => {
      setStings(false);
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
        <div className="text-xs text-muted-foreground">
          {i + 1} of {total}
        </div>

        <div className="flex flex-1 items-center">
          <div
            key={card?.id}
            className={cn(
              "w-full transition-opacity duration-300",
              fading ? "opacity-0" : "opacity-100",
            )}
          >
            <p className="font-serif text-2xl leading-relaxed text-foreground sm:text-[28px]">
              {card?.scenario}
            </p>

            <button
              type="button"
              onClick={() => setStings((v) => !v)}
              className={cn(
                "mt-8 text-xs underline-offset-4 transition-colors",
                stings
                  ? "text-accent underline"
                  : "text-muted-foreground hover:text-foreground hover:underline",
              )}
            >
              {stings ? "this one stings ·" : "this one stings"}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "mt-10 space-y-2 transition-opacity duration-300",
            fading ? "opacity-0" : "opacity-100",
          )}
        >
          {REACTIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => choose(r.value)}
              className="block w-full rounded-md border border-border bg-card px-5 py-4 text-left font-serif text-lg text-foreground transition-colors hover:border-foreground/40 hover:bg-muted"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

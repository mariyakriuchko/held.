import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";
import { cn } from "@/lib/utils";
import {
  readSession,
  updateSession,
  type AgeBand,
  type NumChildren,
  type ParentRole,
} from "@/lib/session";

export const Route = createFileRoute("/begin")({
  component: Begin,
});

const ROLES: { value: ParentRole; label: string }[] = [
  { value: "mother", label: "mother" },
  { value: "father", label: "father" },
  { value: "co_parent", label: "co-parent or other" },
  { value: "prefer_not_to_say", label: "prefer not to say" },
];

const NUMS: NumChildren[] = ["1", "2", "3+"];
const AGES: AgeBand[] = ["0-2", "2-4", "5-7", "8-10", "11+"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-transparent text-foreground hover:border-foreground/50",
      )}
    >
      {children}
    </button>
  );
}

function Begin() {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<ParentRole | null>(null);
  const [num, setNum] = React.useState<NumChildren | null>(null);
  const [ages, setAges] = React.useState<AgeBand[]>([]);

  React.useEffect(() => {
    const s = readSession();
    setRole(s.onboarding.parent_role);
    setNum(s.onboarding.num_children);
    setAges(s.onboarding.age_bands);
  }, []);

  const ready = role && num && ages.length > 0;

  const toggleAge = (a: AgeBand) =>
    setAges((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));

  const next = () => {
    if (!ready) return;
    updateSession((s) => ({
      ...s,
      onboarding: { parent_role: role, num_children: num, age_bands: ages },
    }));
    navigate({ to: "/cards" });
  };

  return (
    <Shell>
      <h2 className="font-serif text-2xl leading-snug text-foreground">
        first, three quiet questions.
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">So the cards can find you.</p>

      <div className="mt-10 space-y-10">
        <section>
          <p className="font-serif text-lg text-foreground">you are…</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <Chip key={r.value} active={role === r.value} onClick={() => setRole(r.value)}>
                {r.label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <p className="font-serif text-lg text-foreground">how many children?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {NUMS.map((n) => (
              <Chip key={n} active={num === n} onClick={() => setNum(n)}>
                {n}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <p className="font-serif text-lg text-foreground">their ages</p>
          <p className="mt-1 text-xs text-muted-foreground">choose all that apply</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {AGES.map((a) => (
              <Chip key={a} active={ages.includes(a)} onClick={() => toggleAge(a)}>
                {a}
              </Chip>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-14">
        <button
          onClick={next}
          disabled={!ready}
          className={cn(
            "rounded-md bg-foreground px-8 py-3 font-serif text-lg text-background transition-opacity",
            ready ? "hover:opacity-90" : "opacity-30",
          )}
        >
          continue
        </button>
      </div>
    </Shell>
  );
}

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

type Skipped = { role: boolean; num: boolean; ages: boolean };

function Chip({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-transparent text-foreground hover:border-foreground/60",
        disabled && "opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function SkipLink({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "ml-2 text-xs underline-offset-4 transition-colors",
        active ? "ink-burgundy underline" : "text-muted-foreground hover:text-foreground hover:underline",
      )}
    >
      {active ? "skipped" : "skip"}
    </button>
  );
}

function Begin() {
  const navigate = useNavigate();
  const [role, setRole] = React.useState<ParentRole | null>(null);
  const [num, setNum] = React.useState<NumChildren | null>(null);
  const [ages, setAges] = React.useState<AgeBand[]>([]);
  const [skipped, setSkipped] = React.useState<Skipped>({
    role: false,
    num: false,
    ages: false,
  });

  React.useEffect(() => {
    const s = readSession();
    setRole(s.onboarding.parent_role);
    setNum(s.onboarding.num_children);
    setAges(s.onboarding.age_bands);
  }, []);

  // Each question is "answered" if a value is picked OR explicitly skipped.
  const ready =
    (role !== null || skipped.role) &&
    (num !== null || skipped.num) &&
    (ages.length > 0 || skipped.ages);

  const toggleAge = (a: AgeBand) => {
    setSkipped((s) => ({ ...s, ages: false }));
    setAges((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  };

  const next = () => {
    if (!ready) return;
    updateSession((s) => ({
      ...s,
      onboarding: {
        parent_role: skipped.role ? null : role,
        num_children: skipped.num ? null : num,
        age_bands: skipped.ages ? [] : ages,
      },
    }));
    navigate({ to: "/cards" });
  };

  return (
    <Shell>
      <h2 className="font-serif text-3xl leading-snug text-foreground">
        three quick questions before we start.
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">Skip anything you'd rather not answer.</p>

      <div className="mt-12 space-y-12">
        <section>
          <div className="flex items-baseline">
            <p className="font-serif text-xl text-foreground">you are…</p>
            <SkipLink
              active={skipped.role}
              onClick={() => {
                setSkipped((s) => ({ ...s, role: !s.role }));
                if (!skipped.role) setRole(null);
              }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <Chip
                key={r.value}
                active={role === r.value && !skipped.role}
                disabled={skipped.role}
                onClick={() => {
                  setSkipped((s) => ({ ...s, role: false }));
                  setRole(r.value);
                }}
              >
                {r.label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-baseline">
            <p className="font-serif text-xl text-foreground">how many children?</p>
            <SkipLink
              active={skipped.num}
              onClick={() => {
                setSkipped((s) => ({ ...s, num: !s.num }));
                if (!skipped.num) setNum(null);
              }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {NUMS.map((n) => (
              <Chip
                key={n}
                active={num === n && !skipped.num}
                disabled={skipped.num}
                onClick={() => {
                  setSkipped((s) => ({ ...s, num: false }));
                  setNum(n);
                }}
              >
                {n}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-baseline">
            <p className="font-serif text-xl text-foreground">their ages</p>
            <SkipLink
              active={skipped.ages}
              onClick={() => {
                setSkipped((s) => ({ ...s, ages: !s.ages }));
                if (!skipped.ages) setAges([]);
              }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">choose all that apply</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {AGES.map((a) => (
              <Chip
                key={a}
                active={ages.includes(a) && !skipped.ages}
                disabled={skipped.ages}
                onClick={() => toggleAge(a)}
              >
                {a}
              </Chip>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-16">
        <button
          onClick={next}
          disabled={!ready}
          className={cn(
            "rounded-md bg-foreground px-10 py-4 font-serif text-xl text-background transition-opacity",
            ready ? "hover:opacity-90" : "opacity-30",
          )}
        >
          continue
        </button>
      </div>
    </Shell>
  );
}

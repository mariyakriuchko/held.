import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";

export const Route = createFileRoute("/")({
  component: Hero,
});

function Hero() {
  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-foreground sm:text-5xl">
          you're carrying more than anyone sees.
        </h1>
        <p className="mt-8 text-base leading-relaxed text-muted-foreground">
          A quiet two minutes about the invisible part of parenting.
          <br />
          No advice. No score. No fixing.
        </p>

        <div className="mt-12">
          <Link
            to="/begin"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-8 py-3 font-serif text-lg text-background transition-opacity hover:opacity-90"
          >
            begin
          </Link>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
          About two minutes. Anonymous.
          <br />
          We're parents trying to understand parents.
        </p>
      </div>
    </Shell>
  );
}

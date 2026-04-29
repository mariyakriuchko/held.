import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";
import { Underline } from "@/components/held/marks";

export const Route = createFileRoute("/")({
  component: Hero,
});

function Hero() {
  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          you're carrying more than{" "}
          <span className="relative inline-block">
            <span className="ink-terracotta">anyone sees</span>
            <Underline
              className="ink-mustard absolute left-0 right-0 -bottom-2 w-full"
              aria-hidden
            />
          </span>
          .
        </h1>

        <p className="mt-10 text-lg leading-relaxed text-foreground/80">
          Two minutes on the invisible part of parenting.
          <br />
          No advice. No score. No fixing.
        </p>

        <div className="mt-12">
          <Link
            to="/begin"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-10 py-4 font-serif text-xl text-background transition-opacity hover:opacity-90"
          >
            begin
          </Link>
        </div>

        <p className="mt-12 text-xs leading-relaxed text-muted-foreground">
          About two minutes. Anonymous.
          <br />
          Skip anything you don't want to answer.
        </p>
      </div>
    </Shell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";

export const Route = createFileRoute("/")({
  component: Hero,
});

function Hero() {
  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          you're carrying more than{" "}
          <span className="ink-accent italic underline-hand">anyone sees</span>.
        </h1>

        <p className="mt-10 text-lg leading-relaxed text-foreground/80">
          Two minutes on the invisible part of parenting.
          <br />
          No advice. No score. No fixing.
        </p>

        <div className="mt-12 border-t border-border/60 pt-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            what this is
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground/80">
            Small moments. The school email at 9pm. The dentist you keep meaning to book.
            Summer sneakers that should have been ordered a week ago.
            <br />
            You say which ones happen in your house. Which ones land on you.
          </p>
        </div>

        <div className="mt-12">
          <Link
            to="/begin"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-10 py-4 font-serif text-xl text-background transition-opacity hover:opacity-90"
          >
            begin
          </Link>
        </div>

        <p className="mt-12 text-xs leading-relaxed text-muted-foreground">
          Anonymous. Skip anything. Built by parents trying to understand parents — your
          answers help the picture.
        </p>
      </div>
    </Shell>
  );
}

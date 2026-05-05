import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onAbout = pathname === "/about";

  return (
    <main
      className={cn(
        "min-h-screen w-full bg-background text-foreground",
        "flex flex-col items-center px-6 py-12 sm:py-20",
        className,
      )}
    >
      <div className="flex w-full max-w-[560px] flex-1 flex-col">
        <header className="mb-12 flex items-baseline justify-between">
          <Link
            to="/"
            className="ink-accent inline-flex items-baseline font-serif text-2xl lowercase leading-none tracking-tight"
            aria-label="held — home"
          >
            <span className="underline-hand">held</span>
            <span aria-hidden className="ml-0.5 text-foreground">.</span>
          </Link>
          {onAbout ? (
            <Link
              to="/"
              className="font-serif text-sm lowercase text-muted-foreground transition-colors hover:text-foreground"
            >
              begin
            </Link>
          ) : (
            <Link
              to="/about"
              className="font-serif text-sm lowercase text-muted-foreground transition-colors hover:text-foreground"
            >
              about us
            </Link>
          )}
        </header>
        {children}
      </div>
      <footer className="mt-16 text-center text-xs text-muted-foreground">
        held · anonymous · parents trying to understand parents ·{" "}
        <Link to="/about" className="underline-offset-4 hover:underline">
          about us
        </Link>{" "}
        ·{" "}
        <Link to="/privacy" className="underline-offset-4 hover:underline">
          privacy
        </Link>
      </footer>
    </main>
  );
}

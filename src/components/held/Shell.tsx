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
            className="inline-flex items-baseline font-serif text-2xl lowercase leading-none tracking-tight text-foreground"
            aria-label="held — home"
          >
            <span>held</span>
            <span aria-hidden className="ml-0.5 ink-accent">.</span>
          </Link>
          {onAbout ? (
            <Link
              to="/"
              className="text-xs lowercase text-muted-foreground transition-colors hover:text-foreground"
            >
              begin
            </Link>
          ) : (
            <Link
              to="/about"
              className="text-xs lowercase text-muted-foreground transition-colors hover:text-foreground"
            >
              about us
            </Link>
          )}
        </header>
        {children}
      </div>
      <footer className="mt-16 text-center text-xs text-muted-foreground">
        held · anonymous ·{" "}
        <Link to="/about" className="underline-offset-4 hover:underline">
          about us
        </Link>{" "}
        ·{" "}
        <Link to="/privacy" className="underline-offset-4 hover:underline">
          privacy
        </Link>{" "}
        · © 2026
      </footer>
    </main>
  );
}

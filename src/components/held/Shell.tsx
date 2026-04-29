import * as React from "react";
import { cn } from "@/lib/utils";

export function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main
      className={cn(
        "min-h-screen w-full bg-background text-foreground",
        "flex flex-col items-center px-6 py-12 sm:py-20",
        className,
      )}
    >
      <div className="flex w-full max-w-[560px] flex-1 flex-col">
        <header className="mb-12">
          <a
            href="/"
            className="ink-accent inline-flex items-baseline font-serif text-2xl lowercase leading-none tracking-tight"
            aria-label="held — home"
          >
            <span className="underline-hand">held</span>
            <span aria-hidden className="ml-0.5 text-foreground">.</span>
          </a>
        </header>
        {children}
      </div>
      <footer className="mt-16 text-center text-xs text-muted-foreground">
        held · anonymous · parents trying to understand parents
      </footer>
    </main>
  );
}

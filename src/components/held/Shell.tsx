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
        <header className="mb-12 text-xs uppercase tracking-[0.32em] text-muted-foreground">
          held
        </header>
        {children}
      </div>
      <footer className="mt-16 text-center text-xs text-muted-foreground">
        held · anonymous · parents trying to understand parents
      </footer>
    </main>
  );
}

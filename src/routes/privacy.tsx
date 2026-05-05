import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";
import {
  privacyMeta,
  privacyIntro,
  privacySections,
} from "@/content/privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: privacyMeta.title },
      { name: "description", content: privacyMeta.description },
      { property: "og:title", content: privacyMeta.title },
      { property: "og:description", content: privacyMeta.description },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <Shell>
      <h1 className="ink-accent font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
        <span className="underline-hand">privacy</span>
        <span aria-hidden className="text-foreground">.</span>
      </h1>

      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        last updated {privacyMeta.lastUpdated}
      </p>

      <p className="mt-10 font-serif text-base leading-relaxed text-foreground/80">
        {privacyIntro}
      </p>

      <div className="mt-12 space-y-10 border-t border-border/60 pt-10">
        {privacySections.map((section) => (
          <section key={section.eyebrow}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.eyebrow}
            </p>
            <p className="mt-3 text-base leading-relaxed text-foreground/80">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </Shell>
  );
}

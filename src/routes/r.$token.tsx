import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/held/Shell";
import { getResult } from "@/server/held.functions";

// Public share page — same data as /result/$token but framed for someone
// who didn't take it yet. Strong OG meta drives the share preview.
export const Route = createFileRoute("/r/$token")({
  loader: async ({ params }) => {
    return await getResult({ data: { token: params.token } });
  },
  head: ({ loaderData }) => {
    const top = loaderData?.top_categories?.[0];
    const desc = top
      ? "A friend wanted you to see this. Two minutes on the invisible part of parenting."
      : "Two minutes on the invisible part of parenting.";
    return {
      meta: [
        { title: "someone shared this with you — held" },
        { name: "description", content: desc },
        { property: "og:title", content: "someone shared this with you — held" },
        { property: "og:description", content: desc },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <Shell>
      <p className="font-serif text-xl text-foreground">we couldn't find that page.</p>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      <Link to="/" className="mt-8 text-sm text-foreground underline underline-offset-4">
        try it yourself
      </Link>
    </Shell>
  ),
  component: PublicResult,
});

function shortLabel(c: string): string {
  switch (c) {
    case "school_comm":
      return "the school messages";
    case "deadlines_prep":
      return "the deadlines and the prep";
    case "appointments":
      return "the appointments quietly slipping";
    case "social_obligations":
      return "the unwritten social obligations";
    case "daily_logistics":
      return "the small daily logistics";
    default:
      return c;
  }
}

function PublicResult() {
  const data = Route.useLoaderData();
  const top = data.top_categories[0];

  return (
    <Shell>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        someone shared this with you
      </p>
      <h1 className="mt-4 font-serif text-3xl leading-[1.2] tracking-tight text-foreground sm:text-4xl">
        {top
          ? `most of what they carry is ${shortLabel(top)}.`
          : "they sat with these cards. they thought of you."}
      </h1>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Held is two minutes on the invisible part of parenting.
        <br />
        No advice. No score. No fixing.
      </p>

      <div className="mt-12">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-foreground px-8 py-3 font-serif text-lg text-background transition-opacity hover:opacity-90"
        >
          try it yourself
        </Link>
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        {data.parents_this_week.toLocaleString()} parents this week.
      </p>
    </Shell>
  );
}

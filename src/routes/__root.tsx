import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-serif text-5xl text-foreground">not here</p>
        <p className="mt-4 text-sm text-muted-foreground">
          This page doesn't exist — or has quietly slipped away.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="text-sm text-foreground underline underline-offset-4 hover:text-accent"
          >
            go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Held — you're carrying more than anyone sees" },
      {
        name: "description",
        content:
          "A quiet two minutes about the invisible part of parenting. No advice. No score. No fixing.",
      },
      { property: "og:title", content: "Held — you're carrying more than anyone sees" },
      {
        property: "og:description",
        content:
          "A quiet two minutes about the invisible part of parenting. No advice. No score. No fixing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/7MBeu0tjqSaZLciMzGXvhLHgaz62/social-images/social-1779101504810-held-banner-1584x396.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/7MBeu0tjqSaZLciMzGXvhLHgaz62/social-images/social-1779101504810-held-banner-1584x396.webp" },
      { name: "twitter:title", content: "Held — you're carrying more than anyone sees" },
      { name: "description", content: "Held makes the invisible mental load of parenting visible through a short, reflective experience." },
      { property: "og:description", content: "Held makes the invisible mental load of parenting visible through a short, reflective experience." },
      { name: "twitter:description", content: "Held makes the invisible mental load of parenting visible through a short, reflective experience." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/brand/held-mark-d-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/brand/held-mark-d-16.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/brand/held-mark-d-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}

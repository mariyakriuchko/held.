
function EmailCapture({ token }: { token: string }) {
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || !email.trim()) return;
    setState("loading");
    try {
      await subscribeEmail({ data: { email: email.trim(), token, source: "result" } });
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className="mt-12 border-t border-border pt-6 font-serif text-lg text-muted-foreground">
        thank you. we'll be in touch when there's something worth saying.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-12 border-t border-border pt-6">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        stay in the loop
      </p>
      <p className="mt-3 font-serif text-lg leading-snug text-foreground">
        want to hear when we add new things? leave your email — no spam, no account.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-md bg-foreground px-5 py-2 font-serif text-base text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {state === "loading" ? "…" : "keep me posted"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-xs text-muted-foreground">
          something went wrong — try again?
        </p>
      )}
    </form>
  );
}

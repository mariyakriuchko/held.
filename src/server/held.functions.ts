import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const reactionEnum = z.enum(["this_is_my_life", "rarely", "not_my_world", "skip"]);

type DeckCard = {
  id: string;
  category: string;
  scenario: string;
  severity: "critical" | "medium" | "light";
};

// Pull a balanced deck: roughly 5 critical + 7 medium + 4 light = 16 cards.
// Filtered by the parent's role + child age bands when provided. Cards with
// empty role_tags / age_tags are treated as "applies to all". If the
// filtered pool is too thin, we top up from the unfiltered pool so the
// flow never breaks.
export const getDeck = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        parent_role: z.string().nullable().optional(),
        age_bands: z.array(z.string()).optional().default([]),
      })
      .optional()
      .default({})
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("cards")
      .select("id, category, scenario, severity, role_tags, age_tags")
      .eq("active", true);
    if (error) throw new Error(error.message);

    type Row = DeckCard & { role_tags: string[]; age_tags: string[] };
    const all = (rows ?? []) as Row[];

    const role = data.parent_role ?? null;
    const ages = data.age_bands ?? [];

    const matches = (c: Row) => {
      const roleOk =
        !role || c.role_tags.length === 0 || c.role_tags.includes(role);
      const ageOk =
        ages.length === 0 ||
        c.age_tags.length === 0 ||
        c.age_tags.some((t) => ages.includes(t));
      return roleOk && ageOk;
    };

    const filtered = all.filter(matches);

    const pickTier = (pool: Row[], t: string, n: number): Row[] =>
      pool
        .filter((c) => c.severity === t)
        .sort(() => Math.random() - 0.5)
        .slice(0, n);

    const targets: Array<["critical" | "medium" | "light", number]> = [
      ["critical", 5],
      ["medium", 7],
      ["light", 4],
    ];

    const picked: Row[] = [];
    const used = new Set<string>();
    for (const [tier, n] of targets) {
      const fromFiltered = pickTier(filtered, tier, n);
      fromFiltered.forEach((c) => used.add(c.id));
      picked.push(...fromFiltered);
      // Top up from the unfiltered pool if we didn't get enough.
      if (fromFiltered.length < n) {
        const fallback = pickTier(
          all.filter((c) => !used.has(c.id)),
          tier,
          n - fromFiltered.length,
        );
        fallback.forEach((c) => used.add(c.id));
        picked.push(...fallback);
      }
    }

    // Strip the tag arrays before returning — the client doesn't need them.
    const out: DeckCard[] = picked.map(({ id, category, scenario, severity }) => ({
      id,
      category,
      scenario,
      severity,
    }));

    // Light final shuffle so severity isn't predictable.
    return out.sort(() => Math.random() - 0.5);
  });


// Submit a completed session: onboarding + reactions + optional reflection.
// Returns the share token.
export const submitSession = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        onboarding: z.object({
          parent_role: z.string().nullable(),
          num_children: z.string().nullable(),
          age_bands: z.array(z.string()),
        }),
        reactions: z.array(
          z.object({
            card_id: z.string().uuid(),
            reaction: reactionEnum,
            weighs: z.boolean().optional().default(false),
          }),
        ),
        reflection: z.string().optional().default(""),
        channel: z.string().optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { data: session, error: sErr } = await supabaseAdmin
      .from("sessions")
      .insert({
        parent_role: data.onboarding.parent_role,
        num_children: data.onboarding.num_children,
        age_bands: data.onboarding.age_bands,
        channel: data.channel ?? null,
      })
      .select("id, token")
      .single();
    if (sErr || !session) throw new Error(sErr?.message ?? "session insert failed");

    if (data.reactions.length > 0) {
      // Filter out reactions whose card_id no longer exists (stale session
      // from before a card re-seed).
      const ids = [...new Set(data.reactions.map((r) => r.card_id))];
      const { data: validCards } = await supabaseAdmin
        .from("cards")
        .select("id")
        .in("id", ids);
      const validIds = new Set((validCards ?? []).map((c) => c.id));
      const rows = data.reactions
        .filter((r) => validIds.has(r.card_id) && r.reaction !== "skip")
        .map((r) => ({
          session_id: session.id,
          card_id: r.card_id,
          reaction: r.reaction,
          weighs: r.weighs,
        }));
      if (rows.length > 0) {
        const { error: rErr } = await supabaseAdmin.from("reactions").insert(rows);
        if (rErr) throw new Error(rErr.message);
      }
    }

    if (data.reflection.trim()) {
      const { error: refErr } = await supabaseAdmin
        .from("reflections")
        .insert({ session_id: session.id, text: data.reflection.trim().slice(0, 2000) });
      if (refErr) throw new Error(refErr.message);
    }

    return { token: session.token };
  });

// Result data, looked up by public token.
// We tally:
//   - top categories (clusters)  -> what kind of load shows up
//   - severity profile           -> whether it's the big slips or the small stuff
export const getResult = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ token: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: session, error } = await supabaseAdmin
      .from("sessions")
      .select("id, parent_role, created_at, headline")
      .eq("token", data.token)
      .single();
    if (error || !session) throw new Error("not found");

    const { data: reactions } = await supabaseAdmin
      .from("reactions")
      .select("card_id, reaction, weighs, cards(category, severity, scenario)")
      .eq("session_id", session.id);

    const tally = new Map<string, number>();
    const catCounts = new Map<string, number>();
    const sevTally: Record<"critical" | "medium" | "light", number> = {
      critical: 0,
      medium: 0,
      light: 0,
    };
    const sevCounts: Record<"critical" | "medium" | "light", number> = {
      critical: 0,
      medium: 0,
      light: 0,
    };

    type Joined = {
      card_id: string;
      reaction: string;
      weighs: boolean;
      cards: {
        category: string;
        severity: "critical" | "medium" | "light";
        scenario: string;
      } | null;
    };

    let topWeighed: { card_id: string; scenario: string } | null = null;
    const weighedScenarios: Array<{ scenario: string; weight: number; category: string }> = [];

    for (const raw of reactions ?? []) {
      const r = raw as unknown as Joined;
      const cat = r.cards?.category;
      const sev = r.cards?.severity;
      if (!cat || !sev) continue;
      const weight =
        (r.reaction === "this_is_my_life" ? 2 : r.reaction === "rarely" ? 1 : 0) +
        (r.weighs ? 2 : 0);
      if (weight === 0) continue;
      tally.set(cat, (tally.get(cat) ?? 0) + weight);
      sevTally[sev] += weight;
      // Counts: only "weighed" cards (this_is_my_life OR explicitly weighs).
      if (r.reaction === "this_is_my_life" || r.weighs) {
        sevCounts[sev] += 1;
        catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
        if (r.cards?.scenario) {
          weighedScenarios.push({ scenario: r.cards.scenario, weight, category: cat });
        }
        if (r.weighs && r.cards?.scenario && !topWeighed) {
          topWeighed = { card_id: r.card_id, scenario: r.cards.scenario };
        }
      }
    }

    const top = [...tally.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([c]) => c);

    const top_categories_detailed = [...catCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    // Dominant severity: which kind of load weighs most.
    const severities: Array<"critical" | "medium" | "light"> = [
      "critical",
      "medium",
      "light",
    ];
    severities.sort((a, b) => sevTally[b] - sevTally[a]);
    const dominant_severity = severities[0];

    const { data: count } = await supabaseAdmin.rpc("parents_this_week");

    // Comparison stat: of the last 100 sessions that had any weighed reaction,
    // how many also weighed the user's top-weighed card?
    let top_card_comparison: {
      scenario: string;
      also_flagged: number;
      sample_size: number;
    } | null = null;

    if (topWeighed) {
      const { data: recent } = await supabaseAdmin
        .from("reactions")
        .select("session_id, card_id, weighs")
        .eq("weighs", true)
        .order("created_at", { ascending: false })
        .limit(500);
      if (recent && recent.length > 0) {
        const sessions = new Set<string>();
        const sessionsWithCard = new Set<string>();
        for (const row of recent as Array<{
          session_id: string;
          card_id: string;
          weighs: boolean;
        }>) {
          sessions.add(row.session_id);
          if (row.card_id === topWeighed.card_id) {
            sessionsWithCard.add(row.session_id);
          }
          if (sessions.size >= 100) break;
        }
        // Recount only across the first ~100 sessions encountered.
        const sample = Math.min(sessions.size, 100);
        if (sample >= 5) {
          top_card_comparison = {
            scenario: topWeighed.scenario,
            also_flagged: sessionsWithCard.size,
            sample_size: sample,
          };
        }
      }
    }

    // Generate (and persist) a personalized headline if we don't have one yet.
    let headline: string | null = session.headline ?? null;
    if (!headline && weighedScenarios.length >= 2) {
      const topScenarios = weighedScenarios
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5)
        .map((s) => s.scenario);
      headline = await generateHeadline(topScenarios, top[0] ?? null, dominant_severity);
      if (headline) {
        await supabaseAdmin
          .from("sessions")
          .update({ headline })
          .eq("id", session.id);
      }
    }

    return {
      headline,
      top_categories: top,
      top_categories_detailed,
      severity_counts: sevCounts,
      dominant_severity,
      parents_this_week: (count as number | null) ?? 0,
      top_card_comparison,
    };
  });

// Calls Lovable AI to write the personalized "this is my life" sentence
// for the result page. Returns null on any failure — the page falls back
// to templated copy.
async function generateHeadline(
  scenarios: string[],
  category: string | null,
  severity: "critical" | "medium" | "light" | undefined,
): Promise<string | null> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return null;
  try {
    const system =
      "you write ONE complete sentence, max 22 words. the sentence MUST start with the word 'you' or \"you're\" or \"you've\" — never drop the subject, never start with 'the one'. the sentence must (1) name that they are the one keeping track of what no one else sees — the step-ahead, invisible tracking — and (2) anchor that with ONE specific scenario from their list, paraphrased naturally into the same sentence. lowercase, calm, second person. no judgment, no 'too much', no 'too heavy', no 'you are not alone', no greetings, no therapy-speak, no quotes, no preamble. vary the opening — e.g. \"you're the one who…\", 'you remember…', \"you've been holding…\", 'you keep track of…'. the reader should think 'yes, that's exactly me' and feel seen, not pitied. output only the sentence.";
    const user = [
      `scenarios they flagged as heavy:`,
      ...scenarios.map((s) => `- ${s}`),
      category ? `\ndominant area: ${category}` : "",
      severity ? `tone: ${severity === "critical" ? "the kind with consequences" : severity === "light" ? "small accumulating stuff" : "steady weight"}` : "",
    ].join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!res.ok) {
      console.error("headline gen failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) return null;
    // Strip any wrapping quotes the model might add.
    return text.replace(/^["'""]+|["'""]+$/g, "").trim();
  } catch (e) {
    console.error("headline gen error", e);
    return null;
  }
}

// Soft email capture for the "stay tuned" promise.
// Returns ok even on duplicate so the UI doesn't leak who already signed up.
export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email().max(255),
        token: z.string().optional(),
        source: z.string().max(40).optional().default("result"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    let session_id: string | null = null;
    if (data.token) {
      const { data: s } = await supabaseAdmin
        .from("sessions")
        .select("id")
        .eq("token", data.token)
        .maybeSingle();
      if (s) session_id = s.id;
    }
    const { error } = await supabaseAdmin
      .from("subscribers")
      .insert({ email: data.email, session_id, source: data.source });
    // 23505 = unique violation: treat as success (idempotent).
    if (error && error.code !== "23505") throw new Error(error.message);
    return { ok: true };
  });

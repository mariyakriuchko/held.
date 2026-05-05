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
// Shuffled within each tier, then concatenated and re-shuffled lightly so
// the parent doesn't always meet the heaviest cards first.
export const getDeck = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("cards")
    .select("id, category, scenario, severity")
    .eq("active", true);
  if (error) throw new Error(error.message);

  const all = (data ?? []) as DeckCard[];
  const byTier = (t: string) =>
    all.filter((c) => c.severity === t).sort(() => Math.random() - 0.5);

  const picked: DeckCard[] = [
    ...byTier("critical").slice(0, 5),
    ...byTier("medium").slice(0, 7),
    ...byTier("light").slice(0, 4),
  ];

  // Light final shuffle so severity isn't predictable.
  return picked.sort(() => Math.random() - 0.5);
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

// Submit optional coping note (after result page).
export const submitCoping = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        token: z.string(),
        text: z.string().optional().default(""),
        chips: z.array(z.string()).default([]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { data: session, error } = await supabaseAdmin
      .from("sessions")
      .select("id")
      .eq("token", data.token)
      .single();
    if (error || !session) throw new Error("session not found");

    const { error: cErr } = await supabaseAdmin.from("coping").insert({
      session_id: session.id,
      text: data.text.trim().slice(0, 2000) || null,
      chips: data.chips,
    });
    if (cErr) throw new Error(cErr.message);
    return { ok: true };
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
      .select("id, parent_role, created_at")
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

    return {
      top_categories: top,
      top_categories_detailed,
      severity_counts: sevCounts,
      dominant_severity,
      parents_this_week: (count as number | null) ?? 0,
      top_card_comparison,
    };
  });

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

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CARDS, getCardById, type Card, type CardSeverity } from "./cards";

const reactionEnum = z.enum(["this_is_my_life", "rarely", "not_my_world", "skip"]);

type DeckCard = {
  id: string;
  category: string;
  scenario: string;
  severity: CardSeverity;
};

// Pull a balanced deck of 10 cards: 3 critical + 4 medium + 3 light.
// Filtered by parent role + age bands when provided. Cards with no role_tags
// / age_tags are treated as "applies to all". If filtered pool is too thin,
// we top up from the unfiltered pool so the flow never breaks.
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
    const all = CARDS.filter((c) => c.active !== false);
    const role = data.parent_role ?? null;
    const ages = data.age_bands ?? [];

    const matches = (c: Card) => {
      const roleTags = c.role_tags ?? [];
      const ageTags = c.age_tags ?? [];
      const roleOk = !role || roleTags.length === 0 || roleTags.includes(role);
      const ageOk =
        ages.length === 0 ||
        ageTags.length === 0 ||
        ageTags.some((t) => ages.includes(t));
      return roleOk && ageOk;
    };

    const filtered = all.filter(matches);

    const pickTier = (pool: Card[], t: CardSeverity, n: number): Card[] =>
      pool
        .filter((c) => c.severity === t)
        .sort(() => Math.random() - 0.5)
        .slice(0, n);

    // Total = 10
    const targets: Array<[CardSeverity, number]> = [
      ["critical", 3],
      ["medium", 4],
      ["light", 3],
    ];

    const picked: Card[] = [];
    const used = new Set<string>();
    for (const [tier, n] of targets) {
      const fromFiltered = pickTier(filtered, tier, n);
      fromFiltered.forEach((c) => used.add(c.id));
      picked.push(...fromFiltered);
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

    const out: DeckCard[] = picked.map(({ id, category, scenario, severity }) => ({
      id,
      category,
      scenario,
      severity,
    }));

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
            card_id: z.string(),
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
      // Filter out any reactions whose card_id is no longer in the library.
      const rows = data.reactions
        .filter((r) => r.reaction !== "skip" && !!getCardById(r.card_id))
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
      .select("card_id, reaction, weighs")
      .eq("session_id", session.id);

    const tally = new Map<string, number>();
    const catCounts = new Map<string, number>();
    const sevTally: Record<CardSeverity, number> = { critical: 0, medium: 0, light: 0 };
    const sevCounts: Record<CardSeverity, number> = { critical: 0, medium: 0, light: 0 };

    let topWeighed: { card_id: string; scenario: string } | null = null;
    const weighedScenarios: Array<{ scenario: string; weight: number; category: string }> = [];

    for (const r of (reactions ?? []) as Array<{
      card_id: string;
      reaction: string;
      weighs: boolean;
    }>) {
      const card = getCardById(r.card_id);
      if (!card) continue;
      const cat = card.category;
      const sev = card.severity;
      const weight =
        (r.reaction === "this_is_my_life" ? 2 : r.reaction === "rarely" ? 1 : 0) +
        (r.weighs ? 2 : 0);
      if (weight === 0) continue;
      tally.set(cat, (tally.get(cat) ?? 0) + weight);
      sevTally[sev] += weight;
      if (r.reaction === "this_is_my_life" || r.weighs) {
        sevCounts[sev] += 1;
        catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
        weighedScenarios.push({ scenario: card.scenario, weight, category: cat });
        if (r.weighs && !topWeighed) {
          topWeighed = { card_id: r.card_id, scenario: card.scenario };
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

    const severities: CardSeverity[] = ["critical", "medium", "light"];
    severities.sort((a, b) => sevTally[b] - sevTally[a]);
    const dominant_severity = severities[0];

    const { data: count } = await supabaseAdmin.rpc("parents_this_week");

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
// for the result page. Returns null on any failure.
async function generateHeadline(
  scenarios: string[],
  category: string | null,
  severity: CardSeverity | undefined,
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
    return text.replace(/^["'""]+|["'""]+$/g, "").trim();
  } catch (e) {
    console.error("headline gen error", e);
    return null;
  }
}

// Soft email capture for the "stay tuned" promise.
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
    if (error && error.code !== "23505") throw new Error(error.message);
    return { ok: true };
  });

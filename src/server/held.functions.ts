import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const reactionEnum = z.enum(["this_is_my_life", "rarely", "not_my_world"]);

// Get the deck for this session — shuffled server-side.
export const getDeck = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("cards")
    .select("id, category, scenario")
    .eq("active", true);
  if (error) throw new Error(error.message);
  // Shuffle and take up to 16
  const shuffled = [...(data ?? [])].sort(() => Math.random() - 0.5).slice(0, 16);
  return shuffled;
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
            stings: z.boolean(),
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
      const rows = data.reactions.map((r) => ({
        session_id: session.id,
        card_id: r.card_id,
        reaction: r.reaction,
        stings: r.stings,
      }));
      const { error: rErr } = await supabaseAdmin.from("reactions").insert(rows);
      if (rErr) throw new Error(rErr.message);
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

// Result page data, looked up by public token.
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
      .select("card_id, reaction, stings, cards(category)")
      .eq("session_id", session.id);

    // Tally categories where the parent said "this is my life" or "stings"
    const tally = new Map<string, number>();
    for (const r of reactions ?? []) {
      const cat = (r as unknown as { cards: { category: string } | null }).cards?.category;
      if (!cat) continue;
      const weight =
        (r.reaction === "this_is_my_life" ? 2 : r.reaction === "rarely" ? 1 : 0) +
        (r.stings ? 2 : 0);
      if (weight === 0) continue;
      tally.set(cat, (tally.get(cat) ?? 0) + weight);
    }

    const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);

    const { data: count } = await supabaseAdmin.rpc("parents_this_week");

    return {
      top_categories: top,
      parents_this_week: (count as number | null) ?? 0,
    };
  });

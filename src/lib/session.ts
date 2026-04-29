// Local-only session state for the Held flow.
// Holds onboarding answers, the current shuffled card deck, and reactions
// in memory + sessionStorage so the experience survives page reloads.
//
// Persistence to the database happens at "submit" moments (after the deck
// finishes, after reflection, after coping). No login, no cross-device sync.

export type ParentRole = "mother" | "father" | "co_parent" | "prefer_not_to_say";
export type NumChildren = "1" | "2" | "3+";
export type AgeBand = "0-2" | "2-4" | "5-7" | "8-10" | "11+";
export type Reaction = "this_is_my_life" | "rarely" | "not_my_world";

export type Onboarding = {
  parent_role: ParentRole | null;
  num_children: NumChildren | null;
  age_bands: AgeBand[];
};

export type CardReaction = {
  card_id: string;
  reaction: Reaction;
  stings: boolean;
};

export type LocalSession = {
  onboarding: Onboarding;
  reactions: CardReaction[];
  reflection: string;
  token: string | null;
};

const KEY = "held.session.v1";

const empty = (): LocalSession => ({
  onboarding: { parent_role: null, num_children: null, age_bands: [] },
  reactions: [],
  reflection: "",
  token: null,
});

export function readSession(): LocalSession {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

export function writeSession(s: LocalSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(s));
}

export function updateSession(updater: (s: LocalSession) => LocalSession) {
  const next = updater(readSession());
  writeSession(next);
  return next;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}

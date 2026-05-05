// ============================================================
// CARD LIBRARY — edit copy directly here.
// ============================================================
// Each card has:
//   id       — stable slug. Once shared with users, don't rename
//              (it's stored in the reactions table as text).
//   category — cluster the card belongs to.
//   severity — "critical" | "medium" | "light".
//   scenario — the line shown to the parent. lowercase, calm,
//              one specific moment. no judgment, no advice.
//
// Optional:
//   role_tags — only show to these parent roles. empty = all.
//   age_tags  — only show to these age bands. empty = all.
//
// To change the copy: edit `scenario`. To add a card: append a
// new object with a unique id. To retire one: set `active: false`.
// ============================================================

export type CardSeverity = "critical" | "medium" | "light";

export type CardCategory =
  | "school_comm"
  | "deadlines_prep"
  | "appointments"
  | "social_obligations"
  | "daily_logistics";

export type Card = {
  id: string;
  category: CardCategory;
  severity: CardSeverity;
  scenario: string;
  role_tags?: string[];
  age_tags?: string[];
  active?: boolean;
};

export const CARDS: Card[] = [
  // ── critical ────────────────────────────────────────────────
  {
    id: "school_comm.buried_quick_note",
    category: "school_comm",
    severity: "critical",
    scenario:
      'The teacher sent a "quick note" last week. You read it, meant to reply, and now it\'s buried.',
  },
  {
    id: "deadlines_prep.activity_signup_closed",
    category: "deadlines_prep",
    severity: "critical",
    scenario:
      "The activity sign-up closed yesterday. You meant to do it Tuesday.",
  },
  {
    id: "deadlines_prep.holiday_care_opens_monday",
    category: "deadlines_prep",
    severity: "critical",
    scenario:
      "Holiday care registration opens Monday. Spots fill in two days. You haven't decided which weeks yet.",
  },
  {
    id: "appointments.referral_expires",
    category: "appointments",
    severity: "critical",
    scenario:
      "The referral expires in two weeks. The waiting list is three months long.",
  },
  {
    id: "appointments.vaccination_reminder_fridge",
    category: "appointments",
    severity: "critical",
    scenario:
      "The vaccination reminder card has been on the fridge since March. Still no appointment scheduled.",
  },

  // ── medium ──────────────────────────────────────────────────
  {
    id: "school_comm.permission_slip_9pm",
    category: "school_comm",
    severity: "medium",
    scenario:
      "A school email landed at 9pm. Permission slip needed by tomorrow morning. You never read the message — and got the call from school to pick up your kid.",
  },
  {
    id: "school_comm.three_threads_named",
    category: "school_comm",
    severity: "medium",
    scenario:
      "Three threads from the class chat today. One mentioned your child by name and you haven't found which.",
  },
  {
    id: "deadlines_prep.costume_day_friday",
    category: "deadlines_prep",
    severity: "medium",
    scenario:
      "Costume day is Friday. The email said this two weeks ago. Nothing has been bought.",
  },
  {
    id: "deadlines_prep.lunch_order_tonight",
    category: "deadlines_prep",
    severity: "medium",
    scenario:
      "The lunch order needs to be in by tonight or it's sandwiches all week.",
  },
  {
    id: "appointments.dentist_eight_months",
    category: "appointments",
    severity: "medium",
    scenario:
      'The dentist said "see you in six months" — that was eight months ago.',
  },
  {
    id: "appointments.pediatrician_followup",
    category: "appointments",
    severity: "medium",
    scenario:
      "The pediatrician wanted a follow-up on that thing. You can't remember if it was four weeks or four months.",
  },
  {
    id: "daily_logistics.library_book_overdue",
    category: "daily_logistics",
    severity: "medium",
    scenario:
      "The library book has been overdue for ten days. You've walked past the library twice.",
  },
  {
    id: "daily_logistics.favourite_leggings_hole",
    category: "daily_logistics",
    severity: "medium",
    scenario:
      "The favourite leggings have a hole in the knee. They're asked for every other morning.",
  },
  {
    id: "social_obligations.bake_sale_tomorrow",
    category: "social_obligations",
    severity: "medium",
    scenario:
      "Bake sale tomorrow. The sign-up sheet has your name on it. You can't remember if you promised lemon cake or chocolate muffins.",
  },
  {
    id: "social_obligations.class_parent_volunteers",
    category: "social_obligations",
    severity: "medium",
    scenario:
      'The class parent asked for "a few volunteers" on Friday. No one has replied yet, including you.',
  },

  // ── light ───────────────────────────────────────────────────
  {
    id: "school_comm.newsletter_unopened",
    category: "school_comm",
    severity: "light",
    scenario:
      "The newsletter went out Sunday. You haven't opened it. There might be a costume day in there.",
  },
  {
    id: "school_comm.whatsapp_poll_14_replies",
    category: "school_comm",
    severity: "light",
    scenario:
      "A WhatsApp poll about next week's outing. Already 14 replies. Yours isn't one of them.",
  },
  {
    id: "deadlines_prep.picture_day_shirt",
    category: "deadlines_prep",
    severity: "light",
    scenario:
      "Picture day is next Wednesday. The good shirt is in the wash.",
  },
  {
    id: "appointments.eye_test_borderline",
    category: "appointments",
    severity: "light",
    scenario:
      'The eye test came back "borderline, recheck in a year." That was a year and a bit ago.',
  },
  {
    id: "daily_logistics.indoor_shoes_tight",
    category: "daily_logistics",
    severity: "light",
    scenario:
      "The indoor shoes are getting tight. No one's said anything yet.",
  },
  {
    id: "daily_logistics.sticker_chart_stopped",
    category: "daily_logistics",
    severity: "light",
    scenario:
      "The sticker chart on the fridge stopped getting stickers two weeks ago. No one has mentioned it.",
  },
  {
    id: "social_obligations.teacher_gift_collection",
    category: "social_obligations",
    severity: "light",
    scenario:
      "Someone in the class chat is collecting for the teacher's gift. €15 by Thursday. You haven't transferred it yet.",
  },
  {
    id: "social_obligations.birthday_party_no_gift",
    category: "social_obligations",
    severity: "light",
    scenario:
      "The birthday party is Saturday. You said yes weeks ago. There's no gift in the house.",
  },
];

export function getCardById(id: string): Card | undefined {
  return CARDS.find((c) => c.id === id);
}

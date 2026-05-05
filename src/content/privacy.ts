// All privacy copy lives here. Edit prose freely; the page renders this verbatim.
// Markers like [TODO: …] must be replaced before publishing.

export const privacyMeta = {
  title: "privacy — held.",
  description: "how held handles your data. anonymous by design.",
  lastUpdated: "2026-05-05",
};

export const privacyIntro = `held is built by parents, for parents. this page explains what we collect, what we don't, and what your rights are. plain language first; legal details below.`;

export type PrivacySection = { eyebrow: string; body: string };

export const privacySections: ReadonlyArray<PrivacySection> = [
  {
    eyebrow: "who runs held",
    body: `held is run by [TODO: founder names]. contact: [TODO: hello@held.tld]. address: [TODO: berlin postal address].`,
  },
  {
    eyebrow: "what we collect",
    body: `an anonymous session id, your card reactions, optional reflection text, optional coping note, and your email — only if you choose to leave one.`,
  },
  {
    eyebrow: "what we don't collect",
    body: `no account. no name. no ad tracking. no third-party analytics. no cookies beyond what's strictly needed for the app to work.`,
  },
  {
    eyebrow: "legal basis (GDPR art. 6)",
    body: `legitimate interest for anonymous product analytics; explicit consent for the optional email signup.`,
  },
  {
    eyebrow: "how we use it",
    body: `to show you your result, to compute aggregate patterns shown to other parents, and to improve the cards. your email is used only to send occasional product updates. we never share or sell your data.`,
  },
  {
    eyebrow: "how long we keep it",
    body: `anonymous reactions are kept indefinitely as part of the aggregate. emails are kept until you ask us to remove them.`,
  },
  {
    eyebrow: "who we share it with",
    body: `nobody. data is hosted on Lovable Cloud (Supabase, EU region) as our processor. we never sell or share data.`,
  },
  {
    eyebrow: "your rights (GDPR art. 15–22)",
    body: `access, rectification, erasure, portability, objection, and the right to withdraw consent. to exercise any of these, email [TODO: hello@held.tld].`,
  },
  {
    eyebrow: "complaints",
    body: `you can lodge a complaint with your local data protection authority. in germany, that's the BfDI or your state DPA.`,
  },
  {
    eyebrow: "changes",
    body: `last updated at the date shown at the top. we'll note any material changes here and on the homepage.`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// W2-A2b CONSTANTS — config/site.ts
//
// INVARIANT     Every value that can change when the customer answers a question
//               has exactly ONE definition, and that definition is a line in
//               this file. Every derived value (Instagram URL, WhatsApp deep
//               link, the `Locale` union) is BUILT from its source constant at
//               the type level, never retyped — so answering a question is one
//               edit on one line, and the derivations follow by construction.
//
// IMPOSSIBLE    (a) Mutating a shared fact at runtime: `SITE.email = 'x'` is a
//               compile error — every export here is `as const`, readonly to its
//               leaves. (b) A drifting second copy of the locale union: `Locale`
//               IS `typeof LOCALES[number]`, so a hand-written `'he' | 'en' | 'fr'`
//               cannot silently disagree with the tuple the app iterates. (c) A
//               hand-concatenated `wa.me` link with a stale number or an
//               unencoded prefill — `whatsappLink()` is the only exported way to
//               build one, and it encodes. The same now holds for the `mailto:`
//               scheme prefix: `mailtoLink()` is the only exported way to build
//               a contact href, and the prefix itself has no other home in this
//               file. (d) A secret leaking through this
//               file: it holds the env var NAME `LEAD_TO_EMAIL` and never reads
//               `process.env`, so it is safe to import from a client component.
//
// CLASS         Closed by derivation for the eight seeded answers below: each is
//               one line, and nothing downstream re-states it, so the whole class
//               "answering the customer costs a hunt" is closed for these values.
//               It is only THIS INSTANCE for the wider class "no value is ever
//               inlined twice" — this file makes the single home exist; it cannot
//               make components use it. That half is closed by the W7 grep gate.
//
// HONEST LIMIT  This file guarantees each value has one definition. It does NOT
//               guarantee a value is CORRECT — eight of them are seeds awaiting a
//               customer answer (ledger §OPEN). It cannot prevent a component
//               from hardcoding a duplicate; only the W7 grep gate can detect
//               that. CONCRETELY, TODAY: `mailtoLink()` below EXISTS but is not
//               yet CALLED — `CONTACT_HREF` in components/sections/Footer.tsx
//               still builds
//               `mailto:` + PUBLIC_EMAIL itself, and that file is outside the
//               write-set of the delegate that added the helper. So the second
//               copy of the scheme prefix is live until Footer switches; the
//               helper makes the switch a one-line edit, it does not perform it.
//               Nothing in this file is covered by a unit test: there is no
//               config/__tests__ directory in this repo (measured, not assumed),
//               so `mailtoLink()` is proved only by the compiler and by the
//               Footer test that will assert its output once Footer calls it.
//               `wineShopLink()` (W12-C) is the one exception, and only at one
//               remove: no test here calls it, but Wine.test.tsx parses the
//               href it produces back off the RENDERED anchor. So it is proved
//               THROUGH a call site, for the four variants that call site uses —
//               never by a test that re-runs the builder and compares the answer
//               to itself.
//
// SOURCE OF ALL SEEDS: `ravid_website1` (the customer's own newest build), file
// and line recorded per value. The one exception is SITE_URL — see its comment.
// This file contains NO memorial facts: no name, date, unit or count. Those are
// message keys (W3), not constants.
// ─────────────────────────────────────────────────────────────────────────────

/* ── Contact ──────────────────────────────────────────────────────────────── */

/** Public/display address, shown in the footer. NOT the lead-delivery address:
 *  that one is the env var named by LEAD_TO_EMAIL_ENV_VAR below, read by W5. */
// OPEN 2 — one-edit item. Seeded from ravid_website1/src/components/Footer.tsx:23. Answering this changes THIS LINE ONLY.
export const PUBLIC_EMAIL = 'ravidtzanani6@gmail.com' as const;

/** NAME of the env var W5 reads to deliver leads. Never a value; never read here. */
export const LEAD_TO_EMAIL_ENV_VAR = 'LEAD_TO_EMAIL' as const;

/** NAME of the env var W5 reads as the verified sending identity. Never a value; never read here. */
export const LEAD_FROM_EMAIL_ENV_VAR = 'LEAD_FROM_EMAIL' as const;

/** E.164, digits only — the machine form. Source: ravid_website1/src/components/FormSection.tsx:125 */
export const PHONE_E164 = '972503112243' as const;

/** Human form, for rendering only. Source: ravid_website1/src/components/FormSection.tsx:130 */
export const PHONE_DISPLAY = '050-311-2243' as const;

/** DERIVED from PHONE_E164 — never retyped. Source of the form: FormSection.tsx:125 */
export const WHATSAPP_BASE_URL = `https://wa.me/${PHONE_E164}` as const;

/* ── Social ───────────────────────────────────────────────────────────────── */

// OPEN 1 — ANSWERED 2026-09-13 by Mati (W16). Two spellings existed across the two
// source repos: this file was seeded 'ravid_.t' from the customer's newest build
// (ravid_website1/src/components/FormSection.tsx:133), while the older repo said
// 'ravid._.t'. Mati ruled that 'ravid._.t' is the real account. The question is
// CLOSED; this line remains the ONLY home of the handle.
export const INSTAGRAM_HANDLE = 'ravid._.t' as const;

/** OPEN 1 (derived half) — ANSWERED with the line above (2026-09-13, by Mati).
 *  DERIVED from INSTAGRAM_HANDLE, so the answer was one edit, not two.
 *  Do NOT retype the handle here. Source: FormSection.tsx:133 */
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}` as const;

/* ── Wine (external shop, wineandfriends.co.il) ───────────────────────────── */

export const WINE_URLS = {
  // OPEN 4 — one-edit item. Seeded from ravid_website1/src/components/WineSection.tsx:9. Answering this changes THIS LINE ONLY.
  red: 'https://wineandfriends.co.il/product/%D7%99%D7%99%D7%9F-%D7%90%D7%93%D7%95%D7%9D-%D7%9C%D7%96%D7%9B%D7%A8-%D7%AA%D7%95%D7%91%D7%9C-%D7%A6%D7%A0%D7%A2%D7%A0%D7%99/',
  // OPEN 4 — one-edit item. Seeded from ravid_website1/src/components/WineSection.tsx:10. Answering this changes THIS LINE ONLY.
  rose: 'https://wineandfriends.co.il/product/%d7%a8%d7%95%d7%96%d7%94-%d7%9c%d7%96%d7%9b%d7%a8-%d7%aa%d7%95%d7%91%d7%9c-%d7%a6%d7%a0%d7%a2%d7%a0%d7%99/',
  // OPEN 4 — one-edit item. Seeded from ravid_website1/src/components/WineSection.tsx:11. Answering this changes THIS LINE ONLY.
  white: 'https://wineandfriends.co.il/product/%d7%99%d7%99%d7%9f-%d7%91%d7%9c%d7%a0%d7%93-%d7%9c%d7%91%d7%9f-%d7%9c%d7%96%d7%9b%d7%a8-%d7%aa%d7%95%d7%91%d7%9c-%d7%a6%d7%a0%d7%a2%d7%a0%d7%99/',
  // OPEN 4 — one-edit item. Seeded from ravid_website1/src/components/WineSection.tsx:14 (TRIO_URL). Answering this changes THIS LINE ONLY.
  trio: 'https://wineandfriends.co.il/product/%d7%9e%d7%90%d7%a8%d7%96-%d7%99%d7%99%d7%9f-%d7%9c%d7%96%d7%9b%d7%a8-%d7%aa%d7%95%d7%91%d7%9c-%d7%a6%d7%a0%d7%a2%d7%a0%d7%99/',
} as const;

export type WineVariant = keyof typeof WINE_URLS;

/* ── Canonical origin ─────────────────────────────────────────────────────── */

// OPEN 5 — one-edit item. NOT a repo fact: zero occurrences in EITHER repo. Only source: REBUILD_PLAN_v1.00.md §7 Q5 (Mati's own document). Answering this changes THIS LINE ONLY.
export const SITE_URL = 'https://www.ravid-speaks.com' as const;

/* ── Wine shop attribution (UTM) — W12-C ──────────────────────────────────── */

/**
 * THE UTM VALUES, stated once. Two params, both FACTUAL: they say where the
 * visitor came from and that they arrived by following an ordinary link. There
 * is no `utm_campaign` below and that is a DECISION, not an omission — there is
 * no campaign. This is a permanent page, not a promotion with a start and an
 * end, and a campaign name would be the site asserting a thing that does not
 * exist. Same reasoning bans `cpc`, `email` or `social` as the medium.
 *
 * WHAT THIS IS ACTUALLY FOR, and why it is not new surveillance: every outbound
 * shop link on this site carries `rel="noopener noreferrer"` (Wine.tsx), and
 * `noreferrer` STRIPS the `Referer` header — so without these params the shop
 * records the memorial site's visitors as `(direct)`. These two values restore
 * exactly the fact a plain link would already have told the shop, and nothing
 * more: the host, and that it was a link. They carry no identity, no page path,
 * no session, no memorial fact.
 *
 * It is deliberately NOT part of `WINE_URLS`: those four lines are the
 * customer's own shop addresses (OPEN 4, one edit each). Attribution is this
 * site's fact about itself, not the shop's, so it lives on its own.
 */
export const WINE_UTM = {
  /** DERIVED from SITE_URL — answering OPEN 5 moves this too, by construction. */
  utm_source: new URL(SITE_URL).host,
  /** An ordinary link from one site to another. The boring, true word for it. */
  utm_medium: 'referral',
} as const;

/**
 * The ONE param name that carries which wine was pressed. Named here, exported,
 * and read back by the test off the rendered anchor — so the test states the
 * VARIANT it expects at each position without restating the param's spelling.
 */
export const WINE_UTM_VARIANT_PARAM = 'utm_content' as const;

/**
 * The ONLY way to build an outbound wine-shop href — the same shape, and the
 * same reason, as `whatsappLink()` and `mailtoLink()` above. No section may
 * concatenate a `?utm_…` by hand, and none may write four of them.
 *
 * `URL`/`searchParams`, never string concatenation: a shop URL that one day
 * arrives with a query of its own (or a fragment) must gain these params, not a
 * second `?`. The base URL's percent-encoded path is passed through untouched —
 * measured, not assumed (`new URL(raw).toString() === raw` for all four).
 */
export function wineShopLink(variant: WineVariant): string {
  const url = new URL(WINE_URLS[variant]);
  for (const [key, value] of Object.entries(WINE_UTM)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set(WINE_UTM_VARIANT_PARAM, variant);
  return url.toString();
}

/* ── i18n ─────────────────────────────────────────────────────────────────── */

/** Source: ravid_website1/src/i18n/translations.ts */
export const LOCALES = ['he', 'en'] as const;

/** DERIVED from LOCALES — never hand-written. W3 depends on this type. */
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'he';

/* ── In-page anchors — a LIVE CONTRACT (ledger D-11) ──────────────────────── */

/**
 * Every CTA in the site targets one of these ids, and every section that is a
 * scroll target renders one. Sources (ravid_website1/src/components/):
 *   top       HeroSection.tsx:12
 *   story     StorySection.tsx:8
 *   form      FormSection.tsx:40
 *   copyright ravid_website1/src/components/Footer.tsx:30
 */
export const SECTION_IDS = {
  top: 'top',
  story: 'story',
  form: 'form',
  copyright: 'copyright',
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

/** The only way to write an in-page href. Prevents `href="#form "` drift. */
export function anchor(id: SectionId): `#${SectionId}` {
  return `#${id}`;
}

/* ── Built links ──────────────────────────────────────────────────────────── */

/**
 * The ONLY way to build a WhatsApp deep link. Optional prefill text is
 * percent-encoded; an empty/absent prefill yields the bare base URL.
 * No section may concatenate `wa.me` by hand.
 */
export function whatsappLink(prefill?: string): string {
  if (prefill === undefined || prefill.length === 0) {
    return WHATSAPP_BASE_URL;
  }
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(prefill)}`;
}

/**
 * DERIVED from PUBLIC_EMAIL — never retyped. Deliberately NOT exported: the
 * function below is the only way out of this file, exactly as `wa.me` is
 * reachable only through `whatsappLink()`, so the scheme prefix cannot be
 * pulled apart from the address and re-concatenated at a call site.
 */
const MAILTO_BASE_HREF = `mailto:${PUBLIC_EMAIL}` as const;

/**
 * The ONLY way to build a `mailto:` href. Optional subject is percent-encoded;
 * an empty/absent subject yields the bare `mailto:` href.
 *
 * Same shape and same reason as `whatsappLink()` above: the address is already
 * one fact (PUBLIC_EMAIL, OPEN 2), but the two characters that turn it into a
 * link were not, and a second caller — W5's lead delivery — would otherwise
 * write its own copy of them, plus its own hand-built, unencoded `?subject=`.
 * No section may concatenate `mailto:` by hand.
 */
export function mailtoLink(subject?: string): string {
  if (subject === undefined || subject.length === 0) {
    return MAILTO_BASE_HREF;
  }
  return `${MAILTO_BASE_HREF}?subject=${encodeURIComponent(subject)}`;
}

/* ── The single aggregate ─────────────────────────────────────────────────── */

export const SITE = {
  url: SITE_URL,
  email: PUBLIC_EMAIL,
  phone: {
    e164: PHONE_E164,
    display: PHONE_DISPLAY,
  },
  instagram: {
    handle: INSTAGRAM_HANDLE,
    url: INSTAGRAM_URL,
  },
  whatsapp: {
    baseUrl: WHATSAPP_BASE_URL,
  },
  wine: WINE_URLS,
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  sections: SECTION_IDS,
  /** env var NAMES only — never values, never read here. */
  env: {
    leadToEmail: LEAD_TO_EMAIL_ENV_VAR,
  },
} as const;

/** DERIVED from the value — never hand-written, so it cannot drift from SITE. */
export type Site = typeof SITE;

// ─────────────────────────────────────────────────────────────────────────────
// W12-B BOOKER PHRASES · THE MEMORIAL GUARD
//
// WHY THIS FILE EXISTS
//   W12-B is the only delegate in this rebuild permitted to author user-visible
//   copy, and the permission is narrow: marketing copy may be drafted, memorial
//   facts may not be touched. A permission that narrow is worthless unless the
//   boundary is MECHANICAL. A reviewer must not have to trust that a delegate
//   stayed inside it; the boundary must be a thing that fails.
//
//   So the boundary is written down ONCE — `CLASSIFICATION` below, one entry per
//   top-level catalogue key — and everything else in this file is DERIVED from
//   it. The classification is not a comment and not a convention: the coverage
//   test makes an unclassified key a RED test, and the guard test makes an edited
//   MEMORIAL or AMBIGUOUS value a RED test, forever, for anyone.
//
// INVARIANT     Every top-level key of messages/he.json and messages/en.json
//               carries exactly one class. Every key classified MEMORIAL or
//               AMBIGUOUS hashes to the value pinned in `PINNED_SHA256` — the
//               values as they stood BEFORE W12-B touched the catalogue. Only
//               keys classified MARKETING are free to change, and even then the
//               reader-facing assertions below pin what a reader actually
//               receives, in both locales, resolved through the real accessor.
//
// IMPOSSIBLE    (a) A memorial string edited silently. Any change to a MEMORIAL
//                   or AMBIGUOUS value changes its SHA-256 and this file goes
//                   red naming the locale and the key.
//               (b) A new key that nobody classified. `CLASSIFICATION` is
//                   compared against the actual key sets both ways, so adding a
//                   key to a catalogue without deciding whether it is a memorial
//                   fact is a red test, not an oversight.
//               (c) A deliberate blank quietly filled. The five documented empty
//                   strings per locale are asserted BY PATH, not by count alone,
//                   so filling one and blanking another still fails.
//               (d) A locale improved and its partner left behind. The two key
//                   sets are proved equal modulo `SOURCE_ONLY_KEYS`, which is
//                   IMPORTED from i18n/messages.ts rather than restated here.
//               (e) Hebrew smuggled into this source file. The last test reads
//                   THIS FILE's own bytes and fails on any character in the
//                   Hebrew block, or on a lowercase-u escape sequence — the
//                   exact hazard that bit D-82 and D-94 tonight, when an editor
//                   silently turned an escape sequence into literal Hebrew inside
//                   a test file and inside a prose comment. It caught this file
//                   too, on its first run: the paragraph you are reading used to
//                   quote such a sequence and the editor unescaped it here as
//                   well. Every Hebrew string this file needs is therefore built
//                   from explicit code points or read out of the catalogue.
//
// CLASS         DERIVATION for the memorial boundary across the whole catalogue,
//               present and future: the guard iterates the classification, not a
//               hand-listed set of keys, so a key added to `CLASSIFICATION` as
//               MEMORIAL is guarded from that moment without editing a test.
//               INSTANCE, explicitly, for the two edits W12-B made: assertions 6
//               and 7 name `whatTitle` and `whatAudienceTitle` directly, because
//               there is nothing to derive — those are the two strings a human
//               must read and approve.
//
// HONEST LIMIT  Six, stated plainly.
//   1. THIS FILE CANNOT TELL A MEMORIAL FACT FROM A MARKETING SENTENCE. The
//      classification is a HUMAN JUDGEMENT, typed in by W12-B and unreviewed by
//      Ravid at the time of writing. What the file guarantees is that the
//      judgement is written down in one place and that the values on the
//      memorial side of it cannot move without a red test. If the judgement is
//      WRONG — if a key marked MARKETING here is in fact a memorial fact — this
//      file will happily let it be edited. The classification table in the W12-B
//      report, not this file, is what Ravid must actually read.
//   2. THE PINNED HASHES ARE A BASELINE, NOT A TRUTH. They record the catalogue
//      as it stood at commit ee5d419e. They prove NOTHING about whether those
//      memorial facts are correct — a wrong date pinned is still a wrong date.
//      See i18n/messages.ts HONEST LIMIT 2, which this file inherits whole.
//   3. SEO EFFECT IS NOT MEASURED AND IS NOT MEASURABLE HERE. Assertions 6 and 7
//      prove a booker phrase is in the text a reader receives. Whether that text
//      ever ranks for that phrase is unmeasured by this file, by this repo, and
//      by this delegate. Nothing here should be read as evidence of a ranking
//      improvement.
//   4. TOP-LEVEL GRANULARITY. A key whose value is an array or object is hashed
//      WHOLE. That is strictly safer than per-element pinning (reordering
//      `testimonials` is caught) but it means the failure message names the key,
//      not the element. `git diff messages/` is the tool for the second question.
//   5. THE GUARD DOES NOT COVER MARKETING KEYS, ON PURPOSE. Pinning every key
//      would make the guard fail on legitimate future copy work and it would
//      stop meaning "a memorial fact moved". The pin set IS the permission
//      boundary; it is not a snapshot of the file.
//   6. `notFound` IS CLASSIFIED HERE BUT DELIBERATELY NOT REPAIRED. Its three
//      values in messages/he.json are ENGLISH ("Oops! Page not found"). That is
//      a real defect, it is not a memorial fact, and it is not marketing copy
//      either — it is UI chrome landed concurrently by another delegate (see
//      i18n/messages.ts HONEST LIMIT 7). W12-B measured it and left it. It is
//      reported to the seat, not fixed here.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { LOCALES, type Locale } from '@/config/site';
import { getMessages, SOURCE_ONLY_KEYS } from '@/i18n/messages';
import enCatalogue from '@/messages/en.json';
import heCatalogue from '@/messages/he.json';

/* ── The boundary, stated once ────────────────────────────────────────────── */

/**
 * MEMORIAL  — a fact about Tuval, his service, his death, his friends, his
 *             family, the donations, the statistics, or a real testimonial.
 *             UNTOUCHABLE. Pinned below.
 * MARKETING — how the lecture is described and sold. Editable under the W12-B
 *             permission. NOT pinned (see HONEST LIMIT 5).
 * AMBIGUOUS — could be read either way. The rule is that ambiguity resolves to
 *             MEMORIAL: treated exactly like MEMORIAL, pinned, never edited.
 */
const MEMORIAL = 'MEMORIAL';
const MARKETING = 'MARKETING';
const AMBIGUOUS = 'AMBIGUOUS';

type KeyClass = typeof MEMORIAL | typeof MARKETING | typeof AMBIGUOUS;

const CLASSIFICATION: Readonly<Record<string, KeyClass>> = {
  // Not copy at all: data consumed by nothing (i18n/messages.ts LIMIT 6).
  dir: AMBIGUOUS,

  // Hero. heroTitle is Tuval's own motto, quoted, and is also the site <title>.
  // heroSubtitle carries his rank and full name; heroSubtitle2 completes that
  // same sentence. All three are memorial facts that happen to sit in the
  // marketing slot, which is exactly why they are pinned.
  heroTitle: MEMORIAL,
  heroSubtitle: MEMORIAL,
  heroSubtitle2: MEMORIAL,
  heroCta: MARKETING,
  heroStory: MARKETING,
  heroDates: MEMORIAL,
  heroRole: MEMORIAL,
  heroBrigade: MEMORIAL,
  heroBattalion: MEMORIAL,

  storyTitle: MEMORIAL,
  storyH3: MEMORIAL,
  storyP1: MEMORIAL,
  storyP2: MEMORIAL,
  storyP3: MEMORIAL,
  storyQuote: MEMORIAL,

  militaryTitle: MEMORIAL,
  militaryCards: MEMORIAL,

  battleTitle: MEMORIAL,
  battleP1: MEMORIAL,
  battleP2: MEMORIAL,
  battleP3: MEMORIAL,

  lecturesTitle: MARKETING,
  lectureItems: MEMORIAL, // donation counts, audience counts, one deliberate ""
  lecturesFooter: MEMORIAL,

  statsTitle: AMBIGUOUS, // frames the statistics; resolves to memorial
  stats: MEMORIAL,

  whatTitle: MARKETING, // EDITED by W12-B
  whatContentTitle: MARKETING,
  whatContent: AMBIGUOUS, // every desc is about Tuval and about the family's loss
  whatAudienceTitle: MARKETING, // EDITED by W12-B
  whatAudience: MARKETING,

  howTitle: MARKETING,
  howFormats: MARKETING, // marketing, but contains a duration figure: not edited

  testimonialsTitle: MARKETING,
  testimonials: MEMORIAL, // real named organisations and bereaved families

  whyTitle: MARKETING,
  whyReasons: AMBIGUOUS, // two of the three are about Tuval and his motto
  whyCta: MARKETING,

  wineTitle: MEMORIAL,
  wineSubtitle: MEMORIAL,
  wineCta: AMBIGUOUS, // commerce CTA for a commemoration product
  wine: AMBIGUOUS, // product names of the memorial wine

  formTitle: MARKETING,
  formSubtitle: MARKETING,
  formName: MARKETING,
  formPhone: MARKETING,
  formEmail: MARKETING,
  formOrg: MARKETING,
  formMessage: MARKETING,
  formNamePh: MARKETING,
  formPhonePh: MARKETING,
  formEmailPh: MARKETING,
  formOrgPh: MARKETING,
  formMsgPh: MARKETING,
  formSubmit: MARKETING,
  formSuccess: MARKETING,
  formSuccessDesc: MARKETING,
  formDirect: MARKETING,
  required: MARKETING,

  // W16-A THE PRIVACY NOTICE. Classified MARKETING because this table has only
  // three buckets and the notice is NOT a memorial fact — it says nothing about
  // Tuval, carries no date, rank, unit or count, and nothing in it is copied from
  // the family's own words. It is a statement about DATA HANDLING, derived from
  // app/api/lead/route.ts and lib/leads/**, and MARKETING here means exactly one
  // thing: not pinned by this guard. HONEST LIMIT 1 of this file applies with
  // full force — if these sentences drift out of agreement with what the code
  // does, nothing in this repository will notice. That check is a human one.
  privacyTitle: MARKETING,
  privacyData: MARKETING,
  privacyPurpose: MARKETING,
  privacyRetention: MARKETING,
  privacyContact: MARKETING,

  footerMemorial: MEMORIAL,
  footerAge: MEMORIAL,
  footerFriends: MEMORIAL,
  footerContact: MARKETING,
  copyright: AMBIGUOUS, // legal notice naming Ravid
  copyrightLink: AMBIGUOUS,

  heroBadges: MEMORIAL, // he-only: unit insignia, proper nouns
  imageAlts: MEMORIAL, // he-only: alt text naming Tuval and the two fallen friends
  notFound: MARKETING, // see HONEST LIMIT 6 — classified, measured, NOT repaired
};

/**
 * SHA-256 of `JSON.stringify(value)` for every MEMORIAL and AMBIGUOUS key, taken
 * from the catalogues as they stood BEFORE W12-B's first edit. Generated, not
 * typed: a hex digest contains no Hebrew, which is why the guard can be total
 * without a single non-ASCII byte in this file.
 */
const PINNED_SHA256: Readonly<Record<Locale, Readonly<Record<string, string>>>> = {
  he: {
    dir: 'd2722123d238632389c9cadeac51de1c352d4f55ee69a90a526ad34cf7e179c6',
    heroTitle: '22001f783415af27d86b4bec84cde1e5271b4085381f374675c356ca10a6a65c',
    heroSubtitle: 'd33c288a61ad2eaed0fb236e471d190eebae0d65b91ec9b0670fe8054d406b44',
    heroSubtitle2: '5ca1643d9b7f59a121461f8a48b337ebade0b4c4f3c735215a5f8c9e65bcb69a',
    heroDates: '4e22c81c0c9fd15fa558476798261f1de4e2411d8d77c038569e973d042c732a',
    heroRole: '3a98227259dd7e4368eff4b873ae1c45ce215a7667a1c372c53bfd849d62ba62',
    heroBrigade: 'd56a80205fcea7daecca6908383e0ea2e31c6ef9536a8cd3117ea92206ea4c0a',
    heroBattalion: 'f1d39b250d2ef602eb4a43dbc7ec9d4c9ec8fc0bd224f69f84fa0c50e7ef50bd',
    storyTitle: '9203427b3b2d234b9f123c98846d2eeea74f7cb5acd9a41220ba8e72964ef1e9',
    storyH3: 'baa4b04aaf42c13ff2cd012440996cc8fc288818ab41f4f1bbf23252911d43ca',
    storyP1: '86e959edb97083e3707b44d3349992e0f3ed375c5887639b23905f22a0f56c6d',
    storyP2: '6134d5ab0db545e6e16843de6b18e9deccd57c1296345915a3496daf8eadc0c2',
    storyP3: '8529587877c0bf76f8637334f1cd1d8e1a475616db816d13c2a59140dd2d8449',
    storyQuote: '753bcb98fed4d16eed9126288a885d0646cc86bc301c7451918c260938b370de',
    militaryTitle: '26153046f3f520645bf3b57fa159e6526ca712e8e346e2a1a80c6360d1cb71d3',
    militaryCards: '5ccfb092c388edb2b831947c8d792a8d10f7e6aee1992a54f6ee356eab119095',
    battleTitle: '6d93c55c4539380333f7133516ad983114c42c08fe0447f0b60148d278489d33',
    battleP1: '0c0c71ab22ba6ff9b99b9a45d13281f669a1c7898457e3ec5a599fab31b3ca89',
    battleP2: '847bd7623a3d6dc1e5417743f0dc4d43410d522e20a88f93922a1789d2401084',
    battleP3: '485a8b0f8830f20c70f0d7bf2ebc35858a487ea726fd00a7e319011d146b52f2',
    lectureItems: '4fa97648a07f90e2996d415d5bb7afd0409762499f0a50f3fffbf1264ce4b183',
    lecturesFooter: '37b4465e241cc210796ddae420c3be2e474c006a3f11d8b3760f872ea965c68c',
    statsTitle: '734ff8318dc60d80c5749a365f14f7471f338168258b37d797473287a8249c4b',
    stats: '5d4a60440137ba6d3bd6241ec49391fd4956bd96634f7979d99354864c235c0c',
    whatContent: 'b588ffc9f5f8c3880bf90ca46db7460ec135a7c468d9d71532c089940b8e4399',
    testimonials: '1f42d9693a07660ca06434a14c92edc1b20a4688e5f4af9d6a9197d305684496',
    whyReasons: '227d8039c2d834755cf96601de31a10ef1c16c519d099f035da7988d8b63bb80',
    wineTitle: '97ac695df737228c671d622f60197e8f7c9c0d02b67ba8b26e1e09fae5cafd09',
    wineSubtitle: '3c569dd0b1c93841395770c6cf42a612c02a4da231f04b6980140db3d5764ac2',
    wineCta: '281b825d428654492f05f1b7a9f4f5b616b8208cf985874699c02110a0107a37',
    wine: 'c9405ed33f210c0775ca66e15faa64d0b7399af44844178313987e6010b66148',
    footerMemorial: 'c77860e3ed86403fd27fcfd54372d1b7fda99218ccd4e4df43fa76308c1c8721',
    footerAge: '8375345f680c11105078044a2200f822933d76166e53ff2b375a75f964b500d0',
    footerFriends: '79dd1f2f28ba6d479159e7540fe295a1f9d9ea4d79a7c665ea523396753923d0',
    copyright: '69397a3530df00992c2969d9d5e71534aa4e30dc08f1ef0049731f9dc7e66680',
    copyrightLink: '635df533c62ca60a2dc0333c5b19e6226fcdd17a2a0eb52309c5936f67d9c9e6',
    heroBadges: 'a67dd7ff71d16c57263bf8cabc7987bb613212ab01a7dc3b0ec3d2a56edcf4af',
    imageAlts: 'edd17014b34863c8859e0ea7513206e79b88e492e1219eaac7576c2a381ab9d6',
  },
  en: {
    dir: 'e953b5c777bfb113a415a6866dc0ca857b6011392fec5ec6932ed69e4f9cc697',
    heroTitle: '559da026116810aa8096be3a33844864708a2944217599c9ae685bef92cd0fd1',
    heroSubtitle: '23d7110c6dbf37a537ee751a347ecc7aef06bed21dc4a515f58827ec70d1ed05',
    heroSubtitle2: '14dc0d27859d70194d6d77ceb70d9537c818ab9e1f6e2b8951f879e9522c28f5',
    heroDates: '4e22c81c0c9fd15fa558476798261f1de4e2411d8d77c038569e973d042c732a',
    heroRole: 'e91a63329330c291855bf378040bf2e91a68886413b4c1b4efd530c1a7161d96',
    heroBrigade: '0aa0a54206ca927d5c2cd1fb21c1f618cdbefbda825d0cd0fe673ec4916621ee',
    heroBattalion: '0034fb1c4057d5b9ce408bd1ca740e06866d86432def622ab51eee0706d36e9d',
    storyTitle: '9ee5aa35dfd5d80ef8f356dfd90cbbe30ba401947bd87b23b66be4677abd83bd',
    storyH3: '00f2b5ece30258085a22b7f8ca38c040c58829a9920ed17aada2837ae4672995',
    storyP1: '58aeb82b4b0e97882d4558f4458b655e618290fe010afc4a55cc535100fd29c0',
    storyP2: '2b8e877ad4d715b9cbc476b167d46e154af254f13828abd21d610a4125c414b6',
    storyP3: '494ea09f53242ad7a30b9e2dcf86440a1a6248894bd7ad816525e6bbc503803b',
    storyQuote: '9f5d9076132a726efacaed5185a5f9fb2dab6c9680751e9ba555a62932be14bc',
    militaryTitle: '3e2f1b8696de4ef5af41767d315d87aee81905339a0209e3c69e3847ecf6237b',
    militaryCards: '2778f0cceaa6b03dfb4f624acd12b89bd81f976357c4d1ff8ee46bd613f15082',
    battleTitle: '580301acceae1970fe4094725cda63dcfd389a0462cedfea4e009cb4b79c835f',
    battleP1: '247744b7fb8618e4ee1c808108ab62ba6f3d4577e882f7aa82f6d1c8d5121e52',
    battleP2: '63b8d2293da254aa1056799cd59557aa92070ec4e714c4ebe824218b15e53b2e',
    battleP3: 'c60616d41f48ef63931e11c28472b4018417490d8e54d2c720fdfd121b029eba',
    lectureItems: '54deddf85c2f4e54c7ae51fbe33f134fcfe3cee985fc9995cc8f377b649bd86d',
    lecturesFooter: '22334297793f6a5be1daa565b4164378c96387f2c92f221e8196cdf443b17c46',
    statsTitle: 'cae4c35921448c735b5a869aba3c204745f103cef82de983c6fcf98a0cc8635b',
    stats: '4d449be8a0b49e2bc0cc2cbebd5813ba9baa4ba39eb19c6e5961754f370f648c',
    whatContent: '13ccffcf71cc5a6a2ccd35689ab229cba24cdc4fecaaa53f5e0a939b21f5bf04',
    testimonials: 'a8916b60f275c856e13fad4fdd691dec7f05866efe6814379992377968a20947',
    whyReasons: 'ae7851994e1bbbdc6a40d7565c0c396eaf9a563d77e0b7860b34a840c3751dcb',
    wineTitle: '6929fe05b66f2e7c4fbe8753f341c37cbd1a944d92c6df575c83db2954d39015',
    wineSubtitle: '09fa53b359f3c0646b7cadfd06c99d805e304ee3ce42789e6b6996511cc9db9b',
    wineCta: '6b6af3c29242ea885c614fd6704fdb4b8a1c71bc815fb37b625d7eb7d94abc7a',
    wine: '6b94debe74258a0c4856034ae3fab0032d4f93c6fd917bff950116798a7652d0',
    footerMemorial: 'd5dd714c5d9a9cc4391fb1ee3d5a4e2341cfc92b71bef282e0c5a751d0fb7d97',
    footerAge: '1a2625ac7a78d97ad789e795c0b43b7a4ce5493e7aa3327adb14ccecb601d16d',
    footerFriends: 'bc21f59357a1e4c5453cd3d1f8a48de50e8d487e78b206b13bd989d925472a28',
    copyright: '0e31892027defb5148a71bc9a80390c7a392c593075147175b805ee079532ff4',
    copyrightLink: '47ccad55c912b7daeec42e936d198cee6dbe394ab811d4d3b3937b5fb3597f03',
    // W16-D: en.json now supplies its own English for these two MEMORIAL keys
    // (badge alts, photograph alts). Pinned here for the first time, because
    // until W16-D en.json did not contain them at all.
    heroBadges: '1e1ba4211a7d8ca3af752e527cfaef40f907f23184fd744ebe596e9fa80971b2',
    imageAlts: 'e448b74b88061b3c134b355527692301886c9a1927461c7c1f8b75d01b7004c0',
  },
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const CATALOGUE_FILES: Readonly<Record<Locale, Readonly<Record<string, unknown>>>> = {
  he: heCatalogue,
  en: enCatalogue,
};

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value), 'utf8').digest('hex');
}

function classOf(key: string): KeyClass {
  const found = CLASSIFICATION[key];
  if (found === undefined) {
    throw new Error(`unclassified catalogue key: ${key}`);
  }
  return found;
}

function isPinned(key: string): boolean {
  return classOf(key) !== MARKETING;
}

/** Length of the longest suffix `a` and `b` share, in code units. */
function commonSuffixLength(a: string, b: string): number {
  let shared = 0;
  while (shared < a.length && shared < b.length) {
    if (a[a.length - 1 - shared] !== b[b.length - 1 - shared]) {
      return shared;
    }
    shared += 1;
  }
  return shared;
}

/** Array/object access without `!` and without `any`. */
function requireAt<T>(items: readonly T[], index: number): T {
  const value = items[index];
  if (value === undefined) {
    throw new Error(`expected an element at index ${index}, found none`);
  }
  return value;
}

/** Every JSON path in `value` whose string is empty. */
function blankPaths(value: unknown, path: string): readonly string[] {
  if (typeof value === 'string') {
    return value.length === 0 ? [path] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => blankPaths(item, `${path}[${index}]`));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, inner]) =>
      blankPaths(inner, path.length === 0 ? key : `${path}.${key}`),
    );
  }
  return [];
}

/**
 * Build a Hebrew string from explicit code points. NEVER inline Hebrew, and
 * NEVER a backslash-u escape — an editor unescaped one into live Hebrew twice
 * tonight (D-82, D-94). The last test proves this file stayed ASCII.
 */
function hebrew(...codePoints: readonly number[]): string {
  return String.fromCodePoint(...codePoints);
}

/** The Hebrew booker phrase for a lecture in memory of a fallen IDF soldier. */
const PHRASE_FALLEN_IDF = hebrew(
  0x5d4, 0x5e8, 0x5e6, 0x5d0, 0x5d4, 0x20, 0x5dc, 0x5d6, 0x5db, 0x5e8, 0x20, 0x5d7, 0x5dc, 0x5dc,
  0x20, 0x5e6, 0x5d4, 0x5f4, 0x5dc,
);

/** The Hebrew booker phrase for an inspiration lecture for pre-military youth. */
const PHRASE_PRE_MILITARY = hebrew(
  0x5d4, 0x5e8, 0x5e6, 0x5d0, 0x5ea, 0x20, 0x5d4, 0x5e9, 0x5e8, 0x5d0, 0x5d4, 0x20, 0x5dc, 0x5de,
  0x5dc, 0x5e9, 0x5f4, 0x5d1, 0x5d9, 0x5dd,
);

/** U+05F4 HEBREW PUNCTUATION GERSHAYIM — not the ASCII double quote. */
const GERSHAYIM = hebrew(0x5f4);

/* ── 1. The classification covers the catalogue, both ways ────────────────── */

describe('the memorial/marketing boundary is total', () => {
  it.each([...LOCALES])('every top-level key of %s.json carries a class', (locale) => {
    const unclassified = Object.keys(CATALOGUE_FILES[locale]).filter(
      (key) => CLASSIFICATION[key] === undefined,
    );
    expect(unclassified).toEqual([]);
  });

  it('classifies no key that the source catalogue does not have', () => {
    const sourceKeys = new Set(Object.keys(CATALOGUE_FILES.he));
    const phantom = Object.keys(CLASSIFICATION).filter((key) => !sourceKeys.has(key));
    expect(phantom).toEqual([]);
  });

  it('resolves ambiguity towards the memorial side, never away from it', () => {
    const guarded = Object.keys(CLASSIFICATION).filter(isPinned);
    const ambiguous = Object.keys(CLASSIFICATION).filter((key) => classOf(key) === AMBIGUOUS);
    expect(ambiguous.every((key) => guarded.includes(key))).toBe(true);
  });
});

/* ── 2. THE GUARD ─────────────────────────────────────────────────────────── */

describe('every memorial fact is byte-identical to its pinned value', () => {
  it.each([...LOCALES])('%s.json memorial and ambiguous values are unchanged', (locale) => {
    const file = CATALOGUE_FILES[locale];
    const pinned = PINNED_SHA256[locale];

    const drifted = Object.keys(file)
      .filter(isPinned)
      .filter((key) => digest(file[key]) !== pinned[key]);

    expect(drifted).toEqual([]);
  });

  it.each([...LOCALES])('%s.json pins every guarded key it actually contains', (locale) => {
    const guardedInFile = Object.keys(CATALOGUE_FILES[locale]).filter(isPinned);
    const unpinned = guardedInFile.filter((key) => PINNED_SHA256[locale][key] === undefined);
    expect(unpinned).toEqual([]);
  });

  it('guards the memorial facts that exist only in the source locale', () => {
    const pinnedHeOnly = SOURCE_ONLY_KEYS.filter(isPinned);
    expect(pinnedHeOnly).toEqual([...SOURCE_ONLY_KEYS]);
  });
});

/* ── 3. Neither locale may be improved without the other ──────────────────── */

describe('the two catalogues stay structurally identical', () => {
  it('en.json is he.json, with every source-only key supplied rather than omitted', () => {
    // W16-D: en.json now carries its own English for every SOURCE_ONLY key, so
    // the key sets are equal. The floor below is what actually guards the
    // structure — en may never drop BELOW he-minus-the-optional-keys — and the
    // equality above it records the state W16-D landed.
    const floor = Object.keys(CATALOGUE_FILES.he)
      .filter((key) => !SOURCE_ONLY_KEYS.some((sourceOnly) => sourceOnly === key))
      .sort();
    const actual = Object.keys(CATALOGUE_FILES.en).sort();
    for (const key of floor) expect(actual).toContain(key);
    expect(actual).toEqual(Object.keys(CATALOGUE_FILES.he).sort());
  });
});

/* ── 4. Both catalogues still satisfy the schema ──────────────────────────── */

describe('the schema still accepts both catalogues', () => {
  it.each([...LOCALES])('getMessages(%s) resolves without throwing', (locale) => {
    expect(() => getMessages(locale)).not.toThrow();
  });
});

/* ── 5. No deliberate blank was filled ────────────────────────────────────── */

describe('the five deliberate blanks per locale are untouched', () => {
  const EXPECTED_BLANKS = [
    'lectureItems[3]',
    'stats[0].desc',
    'stats[2].desc',
    'stats[3].desc',
    'testimonials[0].sub',
  ];

  it.each([...LOCALES])('%s.json has exactly the five documented empty strings', (locale) => {
    expect(blankPaths(CATALOGUE_FILES[locale], '')).toEqual(EXPECTED_BLANKS);
  });
});

/* ── 6 & 7. The text a reader actually receives ───────────────────────────── */
//
// LAW 8: not "the key changed" — the sentence that reaches a reader, resolved
// through the real accessor, in both locales.

describe('the booker phrases reach the reader', () => {
  it('the Hebrew what-you-get heading opens with the fallen-IDF-soldier phrase', () => {
    expect(getMessages('he').whatTitle.startsWith(PHRASE_FALLEN_IDF)).toBe(true);
  });

  it('the English what-you-get heading says the same thing', () => {
    expect(getMessages('en').whatTitle).toContain('A Lecture in Memory of a Fallen IDF Soldier');
  });

  it('the Hebrew audience heading carries the pre-military phrase', () => {
    expect(getMessages('he').whatAudienceTitle).toContain(PHRASE_PRE_MILITARY);
  });

  it('the English audience heading says the same thing', () => {
    expect(getMessages('en').whatAudienceTitle).toContain(
      'an inspiration lecture for pre-military youth',
    );
  });

  it('spells the two phrases with U+05F4 GERSHAYIM, not an ASCII quote', () => {
    const messages = getMessages('he');
    expect(messages.whatTitle).toContain(GERSHAYIM);
    expect(messages.whatAudienceTitle).toContain(GERSHAYIM);
    expect(messages.whatTitle).not.toContain('"');
    expect(messages.whatAudienceTitle).not.toContain('"');
  });

  // The heading's closing audience is not authored here: it is the LAST
  // `whatAudience` card's own words, so the heading cannot promise an audience
  // the cards below it do not list. Proved by longest common suffix rather than
  // by stripping a leading particle, because the particle is one LETTER in
  // Hebrew and one WORD in English, and a test with a branch per locale is a
  // test that can be right in one locale and wrong in the other. 20 is below the
  // shorter of the two real suffixes (21 and 27 characters) and far above noise.
  it.each([...LOCALES])(
    'the %s audience heading closes with the last audience card, not an invented one',
    (locale) => {
      const messages = getMessages(locale);
      const lastCard = requireAt(messages.whatAudience, messages.whatAudience.length - 1);
      expect(commonSuffixLength(messages.whatAudienceTitle, lastCard.title)).toBeGreaterThanOrEqual(
        20,
      );
    },
  );
});

/* ── 8. This file smuggled no Hebrew into source ──────────────────────────── */

describe('no Hebrew character was unescaped into this source file', () => {
  const source = readFileSync(fileURLToPath(import.meta.url), 'utf8');

  it('contains no character in the Hebrew block (U+0590 to U+05FF)', () => {
    const hebrewCharacters = [...source].filter((character) => {
      const point = character.codePointAt(0);
      return point !== undefined && point >= 0x590 && point <= 0x5ff;
    });
    expect(hebrewCharacters).toEqual([]);
  });

  it('contains no backslash-u escape (D-82, D-94)', () => {
    const escapeMarker = `${String.fromCharCode(92)}u`;
    expect(source.includes(escapeMarker)).toBe(false);
  });
});

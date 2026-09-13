// ─────────────────────────────────────────────────────────────────────────────
// W9-E AUTORESPONSE — lib/leads/__tests__/autoresponse.test.ts
//
// LAW 8 — A NAME IS NOT A THING. Nothing below asserts that the renderer "read
// key formSuccessDesc". Every assertion is on the STRINGS THAT COME BACK.
//
//   · The ENGLISH case is asserted against HARDCODED LITERALS — the whole
//     subject and the whole body, character for character, typed into this file
//     and owing nothing to the module under test or to the catalogue accessor.
//     If en.json's copy is edited, this test goes red on purpose: the words in
//     an enquirer's receipt are a contract with the family, not an
//     implementation detail.
//   · The HEBREW case cannot be asserted that way, because this file may not
//     contain a Hebrew codepoint (ledger D-13; the same gate that
//     `app/__tests__/seo.test.ts` applies to its own write-set, applied here to
//     this one). It is asserted instead against messages/he.json read RAW — a
//     different path into the data than `getMessages()`, with the keys chosen
//     here rather than by the renderer — plus the properties that catch every
//     way the locale selection can be wrong: the Hebrew output must contain
//     Hebrew codepoints, and must contain NONE of the English literals.
//
// The regex over the Hebrew block is built with `new RegExp` from ESCAPES, for
// the reason `seo.test.ts` gives where it calls its Hebrew block "built from
// ESCAPES rather than from literal characters": writing the range literally
// would put two
// Hebrew codepoints into the very file that forbids them.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import heRaw from '@/messages/he.json';
import { renderAutoresponse } from '@/lib/leads/autoresponse';
import { createLeadRecord } from '@/lib/leads/types';
import { leadSchema, type Lead } from '@/lib/validation';

/** Hebrew block U+0590–U+05FF, from escapes so this file stays pure ASCII. */
const HEBREW_BLOCK = new RegExp('[\\u0590-\\u05FF]');

/** The paragraph break the renderer uses between its two blocks. */
const PARAGRAPH = '\n\n';

/** The contact fact the page shows under the direct-contact label. */
const PHONE = '050-311-2243';

/** The complete English receipt, typed out. Nothing derives this. */
const EN_SUBJECT = 'Request sent successfully!';
const EN_BODY =
  "We'll get back to you as soon as possible\n\nContact us directly:\n050-311-2243";

/** Strings that must never appear in anything an enquirer receives. */
const FORBIDDEN = [
  'undefined',
  'NaN',
  '[object Object]',
  'formSuccessDesc',
  'formSuccess',
  'formDirect',
  'PHONE_DISPLAY',
];

function lead(overrides: Partial<Lead>): Lead {
  return leadSchema.parse({
    name: 'Tester',
    phone: '0500000000',
    email: 'enquirer@example.com',
    ...overrides,
  });
}

function record(overrides: Partial<Lead>) {
  return createLeadRecord(lead(overrides), 'web_form');
}

describe('renderAutoresponse', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('answers an English enquirer with the English receipt, verbatim', () => {
    const result = renderAutoresponse(record({ locale: 'en' }));

    expect(result).not.toBeNull();
    expect(result?.subject).toBe(EN_SUBJECT);
    expect(result?.body).toBe(EN_BODY);
  });

  it('answers a Hebrew enquirer with the Hebrew receipt, and with no English in it', () => {
    const result = renderAutoresponse(record({ locale: 'he' }));

    expect(result).not.toBeNull();
    // The actual strings, keyed from the raw catalogue by THIS file.
    expect(result?.subject).toBe(heRaw.formSuccess);
    expect(result?.body).toBe(
      `${heRaw.formSuccessDesc}${PARAGRAPH}${heRaw.formDirect}\n${PHONE}`,
    );
    // ...and the properties that catch a locale fallback: Hebrew present,
    // English absent. Either alone would pass a renderer that ignored locale.
    expect(result?.subject).toMatch(HEBREW_BLOCK);
    expect(result?.body).toMatch(HEBREW_BLOCK);
    expect(result?.subject).not.toBe(EN_SUBJECT);
    expect(result?.body).not.toBe(EN_BODY);
    expect(result?.body).not.toContain(EN_SUBJECT);
  });

  it('never emits a key path, an undefined, or an empty segment', () => {
    for (const locale of ['he', 'en'] as const) {
      const result = renderAutoresponse(record({ locale }));
      expect(result, locale).not.toBeNull();

      const subject = result?.subject ?? '';
      const body = result?.body ?? '';

      expect(subject.trim().length, `${locale} subject empty`).toBeGreaterThan(0);
      expect(body.trim().length, `${locale} body empty`).toBeGreaterThan(0);

      for (const needle of FORBIDDEN) {
        expect(subject, `${locale} subject contains ${needle}`).not.toContain(needle);
        expect(body, `${locale} body contains ${needle}`).not.toContain(needle);
      }

      // Exactly two blocks, and not one blank line inside either of them: the
      // only empty segment in the output is the deliberate paragraph break.
      const blocks = body.split(PARAGRAPH);
      expect(blocks, `${locale} block count`).toHaveLength(2);
      for (const block of blocks) {
        for (const line of block.split('\n')) {
          expect(line.trim().length, `${locale} blank line inside a block`).toBeGreaterThan(0);
        }
      }
      // The direct-contact block is a label and the fact beneath it, and the
      // fact is the same in both locales: the number the page shows.
      const directLines = (blocks[1] ?? '').split('\n');
      expect(directLines, `${locale} direct-contact lines`).toHaveLength(2);
      expect(directLines[1], `${locale} phone`).toBe(PHONE);
    }
  });

  it('returns exactly null when there is no address, in either locale', () => {
    for (const locale of ['he', 'en'] as const) {
      expect(renderAutoresponse(record({ locale, email: '' })), locale).toBeNull();
    }
  });

  it('is safe for a caller that reads null as "send nothing"', () => {
    // The shape of the calling code, run for real: no throw, no send, and the
    // record itself is untouched either way.
    const sent: string[] = [];
    for (const payload of [lead({ email: '' }), lead({ email: 'x@example.com' })]) {
      const source = createLeadRecord(payload, 'web_form');
      const message = renderAutoresponse(source);
      if (message !== null) sent.push(message.subject);
      expect(source.payload.email).toBe(payload.email);
      expect(source.deliveryState.status).toBe('pending');
    }
    // `leadSchema` defaults an unstated locale to the site default, which is
    // Hebrew — so the one receipt that WAS rendered is the Hebrew one.
    expect(sent).toEqual([heRaw.formSuccess]);
  });

  it('is pure: rendering opens no network connection', () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    renderAutoresponse(record({ locale: 'he' }));
    renderAutoresponse(record({ locale: 'en' }));
    renderAutoresponse(record({ locale: 'he', email: '' }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('carries 0 Hebrew codepoints in its own source and in the renderer (ledger D-13)', () => {
    const root = process.cwd();
    for (const relative of [
      'lib/leads/autoresponse.ts',
      'lib/leads/__tests__/autoresponse.test.ts',
    ]) {
      const source = readFileSync(join(root, relative), 'utf8');
      expect(source, `${relative} contains Hebrew`).not.toMatch(HEBREW_BLOCK);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// W14-FIX2 CONTROL-CHARACTER SCREEN — lib/__tests__/validation.test.ts
//
// WHY THIS FILE EXISTS. Until 2026-09-13 the mail-header-injection guard in
// `lib/validation.ts` had ZERO tests, and its character classes held raw control
// bytes in the source. One formatter run away from becoming an empty class that
// matches nothing, with no error and no red test anywhere in the repo. The bytes
// are now numbers; this file is the part that notices if the screen ever stops
// firing, whatever the reason.
//
// LAW 8 — A NAME IS NOT A THING. Nothing below asserts that the module contains
// a set, a regex, or the right characters. Every assertion drives a real payload
// through the EXPORTED `leadSchema` and asserts what came back: accepted or
// rejected, and on which field, under which rule name. The internals are not
// imported and are not reachable from here on purpose — an assertion that can
// only be satisfied by the observable behaviour of the schema is the only kind
// that survives the class being silently emptied.
//
// THE RED TEST. `rejects every C0 control and DEL in a header field` and its
// body-field twin enumerate all 128 ASCII code points and assert the exact
// accept/reject partition. If the screen degrades to a class that matches
// nothing, those two report 33 and 30 code points unexpectedly accepted. Every
// other test here is a named instance of the same failure, kept because a
// one-line diagnosis beats a 33-item list.
//
// NOTATION — this file, like the module it guards, contains NO raw control byte
// and NO backslash escape that denotes one. Test characters are constructed with
// `String.fromCodePoint` from numeric literals, which no editor or formatter can
// transform into something else.
// ─────────────────────────────────────────────────────────────────────────────

import { formatIssues, LEAD_FIELD_MAX, leadSchema } from '@/lib/validation';

/** Built from numbers, never typed as characters. */
const NUL = String.fromCodePoint(0x00);
const TAB = String.fromCodePoint(0x09);
const LF = String.fromCodePoint(0x0a);
const VT = String.fromCodePoint(0x0b);
const CR = String.fromCodePoint(0x0d);
const DEL = String.fromCodePoint(0x7f);
const CRLF = CR + LF;

/** The rule name the module reports when a screen rejects. Typed out, not imported. */
const CONTROL_RULE = 'control_character';

/** A lead that must always parse, so an over-rejection is visible as itself. */
const VALID = {
  name: 'Ravid Cohen',
  phone: '050-311-2243',
  email: 'booking@example.org',
  organization: 'Example School',
  message: 'Please call about a memorial evening.',
  locale: 'en',
};

/** The screened set, restated here independently of the module under test. */
function isHeaderUnsafe(codePoint: number): boolean {
  return codePoint < 0x20 || codePoint === 0x7f;
}

function isBodyUnsafe(codePoint: number): boolean {
  return isHeaderUnsafe(codePoint) && codePoint !== 0x09 && codePoint !== 0x0a && codePoint !== 0x0d;
}

/** Rule names reported for one field, or an empty list if the lead parsed. */
function rulesFor(input: unknown, field: string): readonly string[] {
  const result = leadSchema.safeParse(input);
  if (result.success) {
    return [];
  }
  return formatIssues(result.error)
    .filter((issue) => issue.field === field)
    .map((issue) => issue.rule);
}

function rejects(input: unknown): boolean {
  return leadSchema.safeParse(input).success === false;
}

describe('leadSchema control-character screen', () => {
  it('accepts an ordinary lead, so rejection below is the screen and not the schema', () => {
    const result = leadSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it('rejects CRLF in name, the mail-header injection payload itself', () => {
    const input = { ...VALID, name: 'Ravid' + CRLF + 'Bcc: victim@example.org' };
    expect(rejects(input)).toBe(true);
    expect(rulesFor(input, 'name')).toContain(CONTROL_RULE);
  });

  it('rejects a bare LF in organization', () => {
    const input = { ...VALID, organization: 'Example' + LF + 'Bcc: victim@example.org' };
    expect(rejects(input)).toBe(true);
    expect(rulesFor(input, 'organization')).toContain(CONTROL_RULE);
  });

  it('rejects a bare CR in phone', () => {
    const input = { ...VALID, phone: '050' + CR + '311' };
    expect(rejects(input)).toBe(true);
    expect(rulesFor(input, 'phone')).toContain(CONTROL_RULE);
  });

  it('rejects NUL and DEL in name, which no trim and no length cap would catch', () => {
    expect(rejects({ ...VALID, name: 'Ra' + NUL + 'vid' })).toBe(true);
    expect(rejects({ ...VALID, name: 'Ra' + DEL + 'vid' })).toBe(true);
  });

  it('rejects a control character in email before format is even considered', () => {
    expect(rejects({ ...VALID, email: 'book' + CRLF + 'ing@example.org' })).toBe(true);
  });

  it('keeps accepting newlines in message, which is a body value and never a header', () => {
    const message = 'Line one.' + CRLF + 'Line two.' + LF + 'Line' + TAB + 'three.';
    const result = leadSchema.safeParse({ ...VALID, message });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe(message);
    }
  });

  it('still rejects non-newline controls in message', () => {
    expect(rejects({ ...VALID, message: 'a' + NUL + 'b' })).toBe(true);
    expect(rejects({ ...VALID, message: 'a' + VT + 'b' })).toBe(true);
    expect(rejects({ ...VALID, message: 'a' + DEL + 'b' })).toBe(true);
  });

  // ── The two tests that go red if the screen silently matches nothing ──────

  it('rejects every C0 control and DEL in a header field, and nothing else in ASCII', () => {
    const unexpectedlyAccepted: string[] = [];
    const unexpectedlyRejected: string[] = [];

    for (let codePoint = 0x00; codePoint <= 0x7f; codePoint += 1) {
      const name = 'a' + String.fromCodePoint(codePoint) + 'b';
      const rejected = rejects({ ...VALID, name });
      const label = '0x' + codePoint.toString(16).padStart(2, '0');
      if (isHeaderUnsafe(codePoint) && rejected === false) {
        unexpectedlyAccepted.push(label);
      }
      if (isHeaderUnsafe(codePoint) === false && rejected) {
        unexpectedlyRejected.push(label);
      }
    }

    expect(unexpectedlyAccepted).toEqual([]);
    expect(unexpectedlyRejected).toEqual([]);
  });

  it('rejects every control except TAB, LF and CR in message, and nothing else in ASCII', () => {
    const unexpectedlyAccepted: string[] = [];
    const unexpectedlyRejected: string[] = [];

    for (let codePoint = 0x00; codePoint <= 0x7f; codePoint += 1) {
      const message = 'a' + String.fromCodePoint(codePoint) + 'b';
      const rejected = rejects({ ...VALID, message });
      const label = '0x' + codePoint.toString(16).padStart(2, '0');
      if (isBodyUnsafe(codePoint) && rejected === false) {
        unexpectedlyAccepted.push(label);
      }
      if (isBodyUnsafe(codePoint) === false && rejected) {
        unexpectedlyRejected.push(label);
      }
    }

    expect(unexpectedlyAccepted).toEqual([]);
    expect(unexpectedlyRejected).toEqual([]);
  });

  it('screens exactly 33 header code points and 30 body code points in ASCII', () => {
    const headerRejected = Array.from({ length: 0x80 }, (_unused, codePoint) => codePoint).filter(
      (codePoint) => rejects({ ...VALID, name: 'a' + String.fromCodePoint(codePoint) + 'b' }),
    );
    const bodyRejected = Array.from({ length: 0x80 }, (_unused, codePoint) => codePoint).filter(
      (codePoint) => rejects({ ...VALID, message: 'a' + String.fromCodePoint(codePoint) + 'b' }),
    );

    expect(headerRejected).toHaveLength(33);
    expect(bodyRejected).toHaveLength(30);
    expect(headerRejected.length - bodyRejected.length).toBe(3);
  });

  // ── Honest limits, asserted so they are recorded rather than assumed ──────

  it('does not screen C1 controls or U+2028/U+2029, exactly as the module documents', () => {
    expect(rejects({ ...VALID, name: 'a' + String.fromCodePoint(0x85) + 'b' })).toBe(false);
    expect(rejects({ ...VALID, name: 'a' + String.fromCodePoint(0x2028) + 'b' })).toBe(false);
  });

  it('does not reject ordinary non-ASCII text', () => {
    expect(rejects({ ...VALID, name: 'Andr' + String.fromCodePoint(0xe9) + ' Dupont' })).toBe(false);
  });

  it('leaves the field caps alone, so this screen is not a length change', () => {
    expect(LEAD_FIELD_MAX).toEqual({
      name: 120,
      phone: 40,
      email: 254,
      organization: 160,
      message: 4000,
    });
    expect(rejects({ ...VALID, name: 'a'.repeat(LEAD_FIELD_MAX.name) })).toBe(false);
    expect(rejects({ ...VALID, name: 'a'.repeat(LEAD_FIELD_MAX.name + 1) })).toBe(true);
  });
});

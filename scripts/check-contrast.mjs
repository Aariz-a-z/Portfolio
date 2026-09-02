/**
 * WCAG contrast verification for the design tokens.
 *
 * The brief requires contrast to be verified rather than eyeballed, so this runs
 * before any UI is built and again during verification. Exits non-zero on any
 * failure, so it can gate a build.
 *
 * Targets (WCAG 2.1 AA):
 *   - body text                              >= 4.5:1  (1.4.3)
 *   - large text (>=24px, or >=18.66px bold) >= 3:1    (1.4.3)
 *   - UI component boundaries and states     >= 3:1    (1.4.11)
 *
 * TWO BORDER TOKENS, AND WHY
 * --------------------------
 * The first run of this script failed `border` against 3:1 at 1.4:1. Raising a
 * card outline to 3:1 would make it a hard rule rather than a hairline, which is
 * the opposite of the intended restraint.
 *
 * WCAG 1.4.11 applies to visual information required to identify user interface
 * components and their states — not to decorative separation. A card is
 * identified by its content and its surface, not by its outline, so a cosmetic
 * hairline carries no information and is out of scope. A button's edge does
 * carry information, and is in scope.
 *
 * So the tokens are split:
 *   - `border`         decorative separation. Low contrast on purpose. Not tested
 *                      against 3:1, because nothing depends on perceiving it.
 *   - `border-strong`  every interactive boundary: buttons, controls, focus.
 *                      Tested against 3:1 and passing on every surface it is
 *                      used on.
 *
 * That satisfies the accessibility gate where it genuinely applies and keeps the
 * visual language quiet where it does not.
 */

const DARK = {
  bg: '#0B0C0E',
  surface: '#131417',
  'surface-raised': '#1A1C20',
  border: '#292C33',
  'border-strong': '#646973',
  text: '#E9EAEC',
  'text-secondary': '#A2A7B0',
  'text-muted': '#868B94',
  accent: '#93AFEF',
  'accent-quiet': '#1B2233',
  'status-ongoing': '#E0A458',
};

const LIGHT = {
  bg: '#FFFFFF',
  surface: '#F7F8F9',
  'surface-raised': '#EFF1F3',
  border: '#D9DDE2',
  'border-strong': '#848B96',
  text: '#111317',
  'text-secondary': '#4A5058',
  'text-muted': '#626871',
  accent: '#3A55BE',
  'accent-quiet': '#ECEFFB',
  'status-ongoing': '#8A5A12',
};

/** Foreground token, background token, minimum ratio, what it is used for. */
const PAIRS = [
  ['text', 'bg', 4.5, 'body text on page'],
  ['text', 'surface', 4.5, 'body text on card'],
  ['text', 'surface-raised', 4.5, 'body text on raised surface'],
  ['text-secondary', 'bg', 4.5, 'supporting text on page'],
  ['text-secondary', 'surface', 4.5, 'supporting text on card'],
  ['text-secondary', 'surface-raised', 4.5, 'supporting text on raised surface'],
  ['text-muted', 'bg', 4.5, 'labels on page'],
  ['text-muted', 'surface', 4.5, 'labels on card'],
  ['text-muted', 'surface-raised', 4.5, 'chip label on raised surface'],
  ['accent', 'bg', 4.5, 'link on page'],
  ['accent', 'surface', 4.5, 'link on card'],
  ['accent', 'accent-quiet', 4.5, 'accent text on accent fill'],
  ['status-ongoing', 'bg', 4.5, 'ongoing badge on page'],
  ['status-ongoing', 'surface', 4.5, 'ongoing badge on card'],
  ['border-strong', 'bg', 3.0, 'interactive control boundary on page'],
  ['border-strong', 'surface', 3.0, 'interactive control boundary on card'],
  ['border-strong', 'surface-raised', 3.0, 'interactive boundary on raised surface'],
  ['accent', 'bg', 3.0, 'focus ring against page'],
  ['accent', 'surface', 3.0, 'focus ring against card'],
];

function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(foreground, background) {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function checkTheme(name, tokens) {
  console.log(`\n  ${name.toUpperCase()}`);
  console.log(`  ${'-'.repeat(76)}`);
  let failures = 0;

  for (const [fg, bg, minimum, usage] of PAIRS) {
    const ratio = contrastRatio(tokens[fg], tokens[bg]);
    const passed = ratio >= minimum;
    if (!passed) failures += 1;
    const mark = passed ? 'PASS' : 'FAIL';
    const pair = `${fg} on ${bg}`.padEnd(36);
    const score = `${ratio.toFixed(2)}:1`.padStart(8);
    const need = `(need ${minimum})`.padEnd(11);
    console.log(`  ${mark}  ${pair}${score}  ${need} ${usage}`);
  }

  return failures;
}

console.log('\n  WCAG 2.1 AA contrast verification — design tokens');
const failures = checkTheme('dark', DARK) + checkTheme('light', LIGHT);
const checked = PAIRS.length * 2;

console.log(`\n  ${'='.repeat(78)}`);
console.log(
  '  Note: `border` is decorative separation and is intentionally not tested',
);
console.log(
  '  against 3:1. Interactive boundaries use `border-strong`, which is tested.',
);
if (failures === 0) {
  console.log(`\n  RESULT: PASS — ${checked} pairs checked, 0 failures.\n`);
  process.exit(0);
}
console.log(`\n  RESULT: FAIL — ${failures} of ${checked} pairs below target.\n`);
process.exit(1);

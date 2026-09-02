# Aariz Khan — portfolio

Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 4. Statically prerendered,
deployed to Vercel.

```bash
npm install
npm run dev
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run check:contrast` | WCAG contrast of every design token pair |
| `npm run scan:secrets` | Secret scan across source, assets and documents |

---

## Setting the final domain

**This is the only outstanding configuration.** The site deploys correctly
without it — see below for what happens in the meantime.

Pick either one:

**Edit one line.** In [`src/data/site.ts`](src/data/site.ts):

```ts
export const SITE_URL = 'https://your-domain.com';
```

**Or set an environment variable**, which needs no code change:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Either updates canonical links, Open Graph and Twitter URLs, `sitemap.xml`,
`robots.txt` and the JSON-LD `url` together, because all of them derive from one
resolved origin. Nothing else needs touching.

### What happens before you set it

The origin resolves in this order:

1. `NEXT_PUBLIC_SITE_URL`, if set
2. `SITE_URL` in `src/data/site.ts`, once it is a real domain
3. `VERCEL_PROJECT_PRODUCTION_URL` on Vercel **production** builds
4. nothing — and absolute URLs are then omitted rather than invented

So:

| Where | Result |
|---|---|
| Local dev / build | No canonical, empty sitemap. Deliberate: a missing canonical is recoverable, a wrong one is not. |
| Vercel **production** | Full SEO surface using the `.vercel.app` domain. Nothing is degraded. |
| Vercel **preview** | `noindex, nofollow`, no canonical, so a preview never competes with production for the same content. |
| Final domain set | Everything uses it. |

The build prints a reminder while the placeholder is in place. It is a warning,
not an error, and does not block a deploy.

---

## Content

All copy lives in typed data files under [`src/data/`](src/data). Components
render from that data and contain no project copy, so **adding a project is one
object appended to [`projects.ts`](src/data/projects.ts)** and no component
changes. That property is tested and recorded in `VERIFICATION.md` §14.

Three rules the data enforces structurally:

- `stack: []` renders nothing, so an unconfirmed technology list shows no chips
- omitting `links.demo` means no demo button exists in any code path — there is
  no placeholder href to leak
- omitting `evaluation` means no number appears

Every factual claim on the site maps to a resume line, a file in a repository,
or a confirmed answer. That mapping is [`TRUTH-LEDGER.md`](TRUTH-LEDGER.md), and
it is the authority: if the two disagree, the ledger is right.

## Documents

| File | Contents |
|---|---|
| [`AUDIT.md`](AUDIT.md) | Read-only audit of the source material |
| [`PLAN.md`](PLAN.md) | Architecture, design tokens, and the 3D hero plan |
| [`TRUTH-LEDGER.md`](TRUTH-LEDGER.md) | Every claim mapped to its source |
| [`VERIFICATION.md`](VERIFICATION.md) | Executed test output, including failures and fixes |
| [`REVIEW.md`](REVIEW.md) | The site read as a hiring manager would read it |

## The hero

A similarity field: a scalar field over embedded points where proximity is drawn
as light, and the pointer acts as a query that re-weights it. Raw WebGL, one
fragment shader, **3.5 KB gzipped**, lazily imported.

It runs at 1024px and above with a fine pointer. Reduced motion, no WebGL,
Save-Data, no JavaScript and small screens all fall back to a poster exported
from the same shader, or to no visual at all. `scripts/verify-scene.mjs` asserts
each of those paths.

Nothing else on the site animates beyond a single entrance per section.

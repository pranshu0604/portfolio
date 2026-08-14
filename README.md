# pranshu.system — portfolio

Next.js 15 (App Router) · React 19 · Tailwind 3 · TypeScript. Fully static.

```bash
npm run dev     # http://localhost:3000
npm run build   # static prerender
npm start
```

## The idea

The site is a machine you can operate. It boots, it can be driven from a
terminal, and it **wears each project's own UI** as you scroll into it — the
palettes are lifted from the real codebases, not invented.

| Scene | Theme | Source of truth |
| --- | --- | --- |
| Hero / Invsto / Approach / Contact | `base` — light, violet accent | this site |
| EI-LMS | `eilms` — dark violet→indigo, neon glow, Chakra Petch | `Client/LMS/EI-LMS` |
| HQ | `hq` — burnt bronze `#b77932` on slate, bronze bloom | `Personal/hq` |
| P.R.A.N. | `pran` — navy HUD, cyan brackets, Geist Mono | `Personal/ORM/main-worktree` |

The flood happens in a fixed background stack (`.bg-stack`) *behind* the content,
so a theme change never washes over text or images.

## Structure

**Invsto is experience, not a project** — it gets a role masthead and grouped
responsibilities (`Experience.tsx`), no screenshot frame. The 8s → sub-second
re-architecture is one bullet there, with the playable Latency Lab tucked behind
a disclosure. **EI-LMS and P.R.A.N. are the projects** (`Projects.tsx`).

## How the theming works

Palettes are **blended, not swapped**. `lib/palettes.ts` holds each palette as
colour values; `ThemeController.tsx` measures how much of the viewport each
`[data-scene]` owns and writes a weighted mix to CSS variables every frame. A
project's colours bleed in and out with the scroll — including on the way back to
base, which is just the mix tending to zero. There is no cut anywhere.

A soft radial **bloom** (`.bg-bloom`, anchored to the dominant project's
`[data-flood-origin]`) sits in a fixed stack *behind* the content, so the tint
reads as coloured light rather than as paint over the page.

Light/dark is `data-mode` on `<html>` (`ModeToggle.tsx`); project tints blend on
top of either. Add `?theme=eilms` to pin a palette for screenshots.

## Interactive layer

Discovery lives in the **control room** (`ControlRoom.tsx`) — a real section in
the scroll, not chrome. Every entry states *why it is on this site*; if the
reason doesn't hold up, the toy shouldn't ship. The bottom `OpsBar` is now just
ambient instrumentation (FPS, DOM nodes, heap) plus the achievement ledger.

| Thing | File | Entry point |
| --- | --- | --- |
| Ops bar | `OpsBar.tsx` | always visible |
| Command palette | `CommandPalette.tsx` | ⌘K / Ctrl+K |
| Terminal | `Terminal.tsx` | backtick, ops bar, palette |
| **Incident mode** | `Incident.tsx` + `IncidentPuzzles.tsx` | "break my system" — the page degrades; each subsystem is a real micro-puzzle (hold capacity to a drifting load · rebind consumers to queues · replay a cache eviction sequence). MTTR is timed |
| **Packet Rush** | `PacketRush.tsx` | the meta game: each wave cleared recovers a real portfolio artifact |
| **Backpressure** | `Snake.tsx` | snake reframed as a queue consumer: each job consumed extends your backlog, and an unbounded queue eats its own worker. Live worker dashboard beside the board |
| Arcade shell | `Arcade.tsx` | ops bar, `arcade`, palette |
| Desktop mode | `Desktop.tsx` | windowed OS over the site |
| Achievements | `lib/store.ts`, `Toasts.tsx` | 14 of them; panel in the ops bar |
| Latency lab | `LatencySim.tsx` | disclosure under the Invsto bullet |
| Portrait | `Portrait.tsx` | glitch swap + gaze-follow; panics during incidents |
| Reticle cursor | `Cursor.tsx` | pointer-fine only; `data-cursor="label"` annotates |
| Konami + console | `EasterEggs.tsx` | ↑↑↓↓←→←→BA |
| Sound | `lib/sound.ts` | synthesised; **off by default** |

### The meta layer

Packet Rush is the portfolio in disguise. `ARTIFACTS` in `lib/store.ts` maps each
wave to a real piece of the CV; clearing the wave fires a toast and files it in
the arcade and the desktop's `artifacts` window. All seven → the `archivist`
achievement. Everything in there is résumé-sourced.

### Terminal commands

`help` · `whoami` · `ls` · `cat <invsto|ei-lms|pran>` · `goto <section>` ·
`theme <base|eilms|pran>` · `arcade` · `play <snake|rush>` · `desktop` ·
`incident` · `fix <workers|queue|cache>` · `sound <on|off>` · `resume` ·
`contact` · `clear`. History with ↑/↓, completion with Tab.

## Writing

Posts live in `app/data/posts.ts` as typed blocks (`p` / `h` / `ul` / `code` /
`quote`) rather than MDX, so the site stays a zero-dependency static build. Each
one prerenders to `/writing/<slug>`; the homepage index is `Writing.tsx`.

To add a post, append to `POSTS` — the index, the static routes, the terminal
(`posts`, `open <slug>`) and the desktop's writing app all read from that array.

> **These five drafts are a starting point, not finished writing.** They are
> grounded in real work (the latency re-architecture, modular RAG, queue design,
> MCP tooling) but the prose should be rewritten in Pranshu's own voice before
> anyone publishes them under his name.

## Accessibility / fallbacks

`prefers-reduced-motion` disables the boot, the cursor, the glitch scatter, the
gaze-follow, the flood, smooth scroll and the incident screen-shake/tear. The
cursor never engages on touch/coarse pointers. Terminal, palette and both games
are keyboard-driven; focus-visible styles are global. Incident mode always exits
on <kbd>Esc</kbd>, and every overlay closes the same way.

## TODO — needs real content

- [x] Screenshots for EI-LMS, HQ and P.R.A.N. are in `public/projects/`.
      The HQ shot is **deliberately blurred** in five regions (application counts,
      follow-up card, pipeline funnel, personal todos) — see the redaction note below.
- [x] LinkedIn, X, P.R.A.N. live, EI-LMS live + both repos are wired.
- [ ] **Photos** for the desktop `photos` app → `public/photos/`, then list them
      in `Desktop.tsx` (the window is intentionally empty for now).
- [ ] **Dates**: EI-LMS and P.R.A.N. `period` fields are still best guesses.
- [ ] **Source links** still `#`: HQ and P.R.A.N. (push them first).
      HQ deliberately has no live link — single-user and self-hosted by design.
- [x] `public/resume.pdf` is in place (nav, contact and the terminal's `resume` all point at it).
- [ ] **`metadataBase`** in `app/layout.tsx` → the real domain.
- [ ] Confirm the **years** on the early-work cards (`EarlyWork.tsx`) and add repo links.

All prose is résumé- and codebase-sourced — no invented metrics or claims.

## Asset pipeline

Avatars are background-removed with a dependency-free Node script (`rmbg.mjs`,
kept in the working scratchpad): edge/global flood-fill, hole refill, and
auto-erase of a corner watermark. Re-run it if you regenerate the avatars.

### Redaction

`public/projects/hq.png` is a real screenshot of HQ in daily use, so five regions
are blurred before publishing: the mission brief, the follow-up card, the pipeline
counts, the funnel bars (the bar *lengths* leak the ratio, so that region also gets
a scrim) and the personal todo list. Reshooting HQ with seed data would remove the
need for this entirely.

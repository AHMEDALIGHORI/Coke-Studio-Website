# DESIGN.md - Coke Studio Pakistan, a tribute

The direction record for this site. Dial settings, palette/type rationale, and a
one-line reason for every non-obvious visual decision. This exists so future
changes stay on-brief and so the antislop audit's "written reason" items have a
home. Keep it short and honest; update it when a decision changes.

## Dials

- **ENERGY 1** - restrained, one accent at a time. This is a tribute to a
  reverent music show, not a product launch. Motion is slow and cinematic; color
  is spent on Coke red and gold, never everywhere at once.
- **RHYTHM 1** - editorial. Sections breathe with large whitespace and hairline
  rules; the only dense moments are the Hall of Fame rows and the catalog index.
- **MOTION 1** - scroll-driven and purposeful. Everything that moves does so
  because it teaches something (a count landing on a real number, the film
  advancing, the legacy track panning). Nothing bounces for decoration.

## Identity

A cinematic tribute to the longest-running music show in Pakistan (since 2008).
The reference the site answers to is the show's own visual language: a darkened
studio, one pool of light, musicians circled around a microphone. The site tries
to feel like the opening titles of that show.

## Palette

| Token                    | Value                 | Why                                                                                                                                              |
| ------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--void` / `--stage`     | `#08070a` / `#0e0d12` | A warm near-black, not pure black, so the gold and cream read as lit, not as flat UI on a screen.                                                |
| `--coke`                 | `#e8212a`             | The brand accent. Used once per section (kicker dots, the mark, hover fills).                                                                    |
| `--gold` / `--gold-soft` | `#c8a24a` / `#e0c27e` | The "sufi" accent - lamp-light warmth. Italic display words and era marks.                                                                       |
| `--cream` / `--text`     | `#f4efe6` / `#ece7de` | Headline and body. Off-white so it sits in the same warm light as the stage.                                                                     |
| `--muted` / `--muted-2`  | `#9a958c` / `#8a857e` | Secondary text. `--muted-2` was raised to `#8a857e` specifically to clear WCAG AA (4.5:1) on the stage - the original `#6c6862` failed at 3.1:1. |

Palette stays within caps: red and gold never appear in the same element, and
any third color is only a hairline or a tag border.

## Type

- **Display: Bodoni Moda.** A high-contrast didone. Reason: it carries a
  classical, almost film-poster authority that matches a music legacy, and its
  italics let a single word per headline turn gold or red without extra markup.
- **UI: Archivo.** Reason for _not_ Inter: Inter is a model-default typeface
  (flagged R-06). Archivo is an editorial grotesque that stays neutral so all
  personality belongs to Bodoni Moda, but is distinctive enough to not read as
  "default AI site." Swapped from Inter during the audit.
- Pairing reason: the contrast between a didone display and a plain grotesque is
  the whole type system. One loud voice, one quiet voice.

## One-line reasons for specific decisions

- **Scroll-scrubbed hero film (canvas).** The site's thesis is "the legacy as a
  film." A canvas that renders as a pure function of scroll lets the visitor
  _play_ the tribute by scrolling, and it stays crisp at any resolution and needs
  no video download.
- **Dark-only theme (no toggle).** Coke Studio is filmed in a darkened studio and
  the letterboxed-cinema identity depends on it. This is the branded reason
  (R-21); a toggle would fight the concept, so none is shipped.
- **Film grain + vignette overlay.** Sells "projected film" over "web page."
  Kept at 5% opacity and `pointer-events: none` so it never interferes.
- **Custom cursor (dot + ring → "Play").** Reinforces that the anthems are
  _watchable_. The ring expands into a "Play" label over each Hall of Fame card,
  turning a hover into an invitation. Disabled on touch.
- **Marquee ticker (endless loop).** It is the show's constant pulse, a living
  setlist board ticking the artist names past. Speed lifts slightly with scroll
  velocity; it stops entirely under `prefers-reduced-motion`.
  with one editorial two-column feature, so the archive has a human face and a
  focal point before the grid.
- **Room studies image chapter.** Adds a human-centered pause between timeline and
  catalog: one large voice study and two smaller details make the space around the
  live take visible without presenting interpretive imagery as official stills.
  decoration (R-09). They let a viewer scan what kind of performance each row is
  before playing.
- **CTA arrow (→ on "Visit the official channel").** A directional cue marking an
  external action that leaves the tribute (R-08). It nudges off-site without
  stealing focus.
- **Glow / shadow / scrim doses.** Progress-bar glow (1 element), loader seal
  pulse (1), poster + modal shadows (2), keyart scrim (functional, keeps the
  painted art legible over the film). All within caps (R-13); each is the single
  glow in its region.
- **Loader with count.** Sets the reverent tone before the first scroll and gives
  the film a clean "lights down" entrance. Skipped instantly under reduced motion.

## Accessibility floor (non-negotiable)

- `--muted-2` and body text clear WCAG AA on their backgrounds.
- Play-icon glyphs sit on the near-black stage (not on the colored hover fill) so
  they clear 3:1 on every anthem accent.
- Skip link, real focus rings (no `outline: none`), a focus trap in the modal with
  focus restore, and a working mobile menu at ≤720px.

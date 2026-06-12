---
version: 1.0
name: SemantIC-design-system
description: >
  Design-System des SemantIC-Frontends (Nuxt 4) – Variante C «Laborjournal»:
  eine ruhige Galeriewand-Ästhetik mit IBM Plex Sans/Mono, Hairline-Rahmen statt
  Schatten und genau einer chromatischen Akzentfarbe (Severity-Rot = Akzent).
  Tiefe entsteht ausschliesslich über Flächenwechsel; Severity wird immer doppelt
  kodiert (Farbe + Wort).

colors:
  # ── Flächen / Grund ──
  canvas: "#eeefe9"        # warm-oliver Cremegrund – Karten-Boden, Verdikt-/Dim-Flächen
  surface: "#ffffff"       # innere Karten-Fläche (Body, Daten-Block)
  surface-2: "#e8e9e2"     # dezent dunkler – Bildhintergrund, eingesenkte Flächen
  page-bg: "#e4e5dd"       # Seitenhintergrund (body, hinter den Karten)
  # ── Text / Ink (olive-charcoal) ──
  ink: "#23251d"           # Hauptfarbe – Headlines, Werte, tragender Text
  ink-soft: "#33342d"      # leicht abgesetzt – sekundäre Werte, Labels
  muted: "#5c5e54"         # sekundärer Text (AA-Kontrast auf canvas/surface)
  subtle: "#63655b"        # NUR Captions/Kicker – nie tragender Text (≥4.5:1 auch auf page-bg)
  # ── Linien ──
  line: "#c4c6bb"          # dünne Standard-Trennlinien, Karten-Rahmen
  line-soft: "#dcded3"     # sehr dezente Trennlinien (Daten-Zeilen)
  line-strong: "#a9aa9f"   # kräftigere Inner-Karten-Trennlinien (Dim-Spalten)
  # ── Severity-Ampel (einziger chromatischer Akzent) ──
  safe: "#2c8c66"          # OK – Punktfarbe / Indikatorfläche
  safe-ink: "#1f6b4d"      # OK – Textton (AA)
  warn: "#c8921f"          # WARN – Punktfarbe / Indikatorfläche
  warn-ink: "#876012"      # WARN – Textton (AA)
  crit: "#cd4239"          # CRIT – Punktfarbe / Indikatorfläche
  crit-ink: "#a5322b"      # CRIT – Textton (AA)
  # ── Dunkle Flächen (Ink-Inversion, Frontend 1.5) ──
  ink-surface: "#23251d"   # = ink; dunkler Sektionsgrund (Header, Maskierung, Closer)
  ink-surface-2: "#2c2e25" # abgesetzte Tafel auf dunkel (Flächenwechsel)
  ink-line: "#44463c"      # Hairlines auf dunkel
  ink-text: "#eeefe9"      # = canvas; Haupttext auf dunkel (~13:1)
  ink-text-soft: "#c8cabd" # Sekundärtext auf dunkel (~9:1)
  ink-text-muted: "#9a9c8e" # Captions/Mono-Kleindruck auf dunkel (~5.6:1, AA)
  # ── Aliases (Iterationsspur, auf Variante C gemappt) ──
  bg: "#ffffff"            # = var(--surface)
  paper: "#eeefe9"         # = var(--canvas)
  accent: "#cd4239"        # = var(--crit) – DERSELBE Hex, EIN Akzent (Verdikt-Punkt)
  soft: "rgba(35, 37, 29, 0.55)"  # Ink bei 55 % – Schraffuren, Hauchlinien

typography:
  body:
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif'
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  heroHeadline:
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif'
    fontSize: clamp(40px, 6.2vw, 68px)
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: -0.035em
  sectionHeadline:           # Landing .h2 (Galeriewand-Tafeln)
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif'
    fontSize: clamp(28px, 4.6vw, 46px)
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: -0.03em
  closerHeadline:            # Schluss-CTA (dunkel)
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif'
    fontSize: clamp(26px, 3.4vw, 40px)
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: -0.03em
  lead:                      # Landing-Fliesstext / Hero-Subline
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif'
    fontSize: clamp(15px, 1.5vw, 17px)
    fontWeight: 400
    lineHeight: 1.64         # Hero-Subline: 1.55
  kicker:                    # Hero-Kicker / Landing-Eyebrow
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: 11px
    fontWeight: 500
    letterSpacing: 0.16em    # uppercase
  monoMicroline:             # Hero-Microline («Research Preview …»)
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: 11.5px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0.03em
  monoLabel:                 # Footer-Spalten-h3, DimBadge-Label, NoteBlock-Kicker
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace'
    fontSize: 11px
    fontWeight: 600
    letterSpacing: 0.14em    # uppercase
  scoreLarge:                # DimBadge-Score-Zahl
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif'
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: -0.02em
  headingDefaults:           # base.css h1–h4 (Komponenten überschreiben)
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif'
    fontSize: "h1: 26px / h2: 20px / h3: 16px / h4: 14px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.02em

layout:
  container: 1100px                  # Standard-Inhaltsbreite
  container-text: 720px              # Lesespalte (Langtext)
  gutter: clamp(20px, 5vw, 48px)     # seitliches Container-Padding
  header-h: 64px                     # Desktop; 56px ab max-width 719px

rounded:
  r: 6px        # --r, Standard-Radius für Karten/Felder («kantig»)
  tag: 2px      # Dim-Stat-Tags, Score-Bar (Tailwind rounded-tag)
  chip: 3px     # Hero-Status-Tag, Chips (Tailwind rounded-chip)
---

# SemantIC – Design-System

## Overview

SemantIC folgt der Designrichtung **Variante C «Laborjournal»** – ein PostHog-artiges
System ohne Maskottchen: nüchtern, dokumentarisch, mit der Anmutung eines
Mess-Protokolls. Die Landing ist als **Galeriewand** komponiert: zentrierte,
hairline-gerahmte Tafeln auf ruhigem Seitenhintergrund, verbunden durch eine
vertikale Mittel-Hairline.

Grundprinzipien:

- **Tiefe über Flächenwechsel, nicht über Schatten.** Es gibt keine box-shadows
  auf Karten. Hierarchie entsteht durch den Wechsel zwischen `{colors.page-bg}`,
  `{colors.canvas}`, `{colors.surface}` und `{colors.surface-2}` – auf dunklen
  Sektionen analog `{colors.ink-surface}` → `{colors.ink-surface-2}`.
- **Eine Akzentfarbe.** `{colors.accent}` und `{colors.crit}` sind derselbe
  Hex-Wert (#cd4239). Der rote Punkt am Satzende («Überzeugend ist nicht genug.»)
  ist der einzige chromatische Akzent ausserhalb der Severity-Ampel.
- **Doppelkodierung Farbe + Wort.** Severity wird nie nur farblich kommuniziert –
  immer steht das Wort (OK/WARN/CRIT bzw. das deutsche Urteilswort) daneben.
- **Mono-Kicker-Prinzip.** IBM Plex Mono trägt Kicker, Captions, Daten, Scores
  und Identifier – uppercase mit weitem letter-spacing. IBM Plex Sans trägt
  Headlines und Fliesstext.
- **Progressive Disclosure.** Sofort sichtbar: Ampel, Scores, Urteilswörter.
  Aufklappbar: Befund-Einzeiler, Treiber-Chips. Auf Wunsch: Vertiefung,
  Roh-Daten. Kein LLM-Fliesstext in der Hauptansicht.

## Colors

### Flächen / Grund

- **canvas** `{colors.canvas}` – warm-oliver Cremegrund; Karten-Boden,
  Verdikt-/Dim-Flächen, Footer-Hintergrund.
- **surface** `{colors.surface}` – innere Karten-Fläche (Body, Daten-Block);
  hellster Moment der Landing (§4 «Einordnung»).
- **surface-2** `{colors.surface-2}` – dezent dunkler; Bildhintergrund,
  eingesenkte Flächen, neutrale Badges.
- **page-bg** `{colors.page-bg}` – Seitenhintergrund (body), hinter den Karten.

### Text / Ink (olive-charcoal)

Typografie trägt die Hierarchie, nicht Farbe.

- **ink** `{colors.ink}` – Hauptfarbe; Headlines, Werte, tragender Text.
- **ink-soft** `{colors.ink-soft}` – leicht abgesetzt; sekundäre Werte, Labels.
- **muted** `{colors.muted}` – sekundärer Text; AA-Kontrast auf canvas/surface
  (Kommentar in tokens.css).
- **subtle** `{colors.subtle}` – NUR Captions/Kicker, nie tragender Text.
  In 1.5 von #7c7e72 abgedunkelt (WCAG-AA-Fix nach Codex-Befund): erreicht
  jetzt ≥4.5:1 auch auf `{colors.page-bg}`, der kritischsten hellen Fläche.

### Linien

Flache, bordered Karten – keine Schatten.

- **line** `{colors.line}` – dünne Standard-Trennlinien, Karten-Rahmen (1px).
- **line-soft** `{colors.line-soft}` – sehr dezente Trennlinien (Daten-Zeilen,
  Hint-Listen).
- **line-strong** `{colors.line-strong}` – kräftigere Inner-Karten-Trennlinien
  (Dim-Spalten, Chip-Rahmen, Link-Unterstriche).

### Severity-Ampel

Der EINZIGE chromatische Akzent. Pro Stufe ein Paar: Punktfarbe
(Indikator/Fläche) + dunklerer `*-ink`-Ton (Text, AA-Kontrast). Nie als
flächiger Karten-Hintergrund. Doppelkodierung: Farbe IMMER zusammen mit dem
Severity-Wort. Schwellen: **≥70 OK (safe) · 40–69 WARN · <40 CRIT**.

- **safe** `{colors.safe}` / **safe-ink** `{colors.safe-ink}` – OK.
- **warn** `{colors.warn}` / **warn-ink** `{colors.warn-ink}` – WARN.
- **crit** `{colors.crit}` / **crit-ink** `{colors.crit-ink}` – CRIT.

### Dunkle Flächen (Ink-Inversion) – neu in Frontend 1.5

Für bewusst dunkle Bereiche: App-Header, Landing-Sektion «Die Maskierung»,
Schluss-CTA. Tiefe weiterhin über Flächenwechsel, kein Schatten.

- **ink-surface** `{colors.ink-surface}` – dunkler Sektionsgrund (= `{colors.ink}`).
- **ink-surface-2** `{colors.ink-surface-2}` – abgesetzte Tafel auf dunkel.
- **ink-line** `{colors.ink-line}` – Hairlines auf dunkel.
- **ink-text** `{colors.ink-text}` – Haupttext auf dunkel (= `{colors.canvas}`, ~13:1).
- **ink-text-soft** `{colors.ink-text-soft}` – Sekundärtext auf dunkel (~9:1).
- **ink-text-muted** `{colors.ink-text-muted}` – Captions/Mono-Kleindruck auf
  dunkel (~5.6:1, AA).

**REGEL (tokens.css, präzisiert):** Keine Severity-Farben für Wörter oder
Kleintext auf dunklen Flächen – `{colors.crit}` erreicht auf
`{colors.ink-surface}` nur ~3.3:1. Der rote Verdikt-Punkt ist als Grafik ok
(3:1-Schwelle für Nicht-Text), als Textfarbe nicht. Neutraler Kleintext in
`{colors.ink-text-muted}` ist erlaubt (~5.6:1, AA) – der dunkle Header nutzt
ihn für Kicker und Rate-Hinweis.

### Aliases

Aus der Iterationsspur erhalten, auf Variante C gemappt:

- **bg** = `{colors.surface}` · **paper** = `{colors.canvas}`
- **accent** = `{colors.crit}` – derselbe Hex; so bleibt das System bei genau
  einem chromatischen Akzent (Verdikt-Punkt am Satzende).
- **soft** `rgba(35, 37, 29, 0.55)` – Ink bei 55 %; Schraffuren, Hauchlinien.

Tailwind mappt alle Tokens per `var()` (keine Hex-Duplikate):
`bg-canvas`, `bg-surface`, `text-ink`, `text-ink-soft`, `text-muted`,
`text-subtle`, `border-line`, `border-line-strong`, `bg-safe`/`text-safe-ink`
usw. sowie `rounded` (= `--r`), `rounded-tag` (2px), `rounded-chip` (3px).
Die `--ink-*`-Dunkelflächen-Tokens sind NICHT im Tailwind-Mapping – sie werden
in scoped CSS per `var()` verwendet.

## Typography

### Font Family

- **IBM Plex Sans** – Headlines, Fliesstext, UI-Labels.
- **IBM Plex Mono** – Kicker, Captions, Daten, Scores, Tags, Identifier
  (`.mono`-Utility mit `font-feature-settings: "tnum"`).

Geladen via Google Fonts in `nuxt.config.ts` (`preconnect` auf
fonts.googleapis.com + fonts.gstatic.com, dann ein Stylesheet-Link):
IBM Plex Mono **400/500/600/700** + IBM Plex Sans **400/500/600/700**,
`display=swap`. Fallback-Stacks: `system-ui, sans-serif` bzw.
`ui-monospace, monospace`. Der body setzt global `font-feature-settings: "tnum"`
(tabellarische Ziffern, damit Scores nicht springen).

### Hierarchy

- `{typography.heroHeadline}` – Hero-H1 («Überzeugend ist nicht genug.»),
  clamp(40px, 6.2vw, 68px) / 700 / 0.98 / −0.035em.
- `{typography.sectionHeadline}` – Landing-Tafel-H2,
  clamp(28px, 4.6vw, 46px) / 700 / 1.06 / −0.03em, max-width 18ch, text-wrap: balance.
- `{typography.closerHeadline}` – Schluss-CTA-H2,
  clamp(26px, 3.4vw, 40px) / 700 / 1.08 / −0.03em.
- `{typography.lead}` – Landing-Lead / Hero-Subline,
  clamp(15px, 1.5vw, 17px), Zeilenlänge 46–58ch.
- `{typography.body}` – 15px / 1.5 (base.css-Default).
- `{typography.kicker}` – Mono 11px / 500 / 0.16em / uppercase
  (Hero-Kicker, Landing-Eyebrow).
- `{typography.monoLabel}` – Mono 11px / 600 / 0.14em / uppercase
  (Footer-h3, DimBadge-Label, NoteBlock-Kicker).
- `{typography.monoMicroline}` – Mono 11.5px (Hero-Microline);
  verwandte Kleindrucke: 10–11px in Badges, Skala, Footer-Bottom.
- `{typography.scoreLarge}` – 34px / 700 (DimBadge-Score, neutral in ink).
- `{typography.headingDefaults}` – base.css h1–h4 als Fallback
  (26/20/16/14px, 700, −0.02em, 1.15); Komponenten überschreiben.

### Principles

- **Typo trägt die Hierarchie, nicht Farbe.** Grössen-/Gewichts-Kontraste
  statt Farbflächen; Text bleibt in der Ink-Skala.
- **Mono nur für Kicker, Captions und Daten** – nie für Fliesstext.
  Mono-Kicker immer uppercase mit letter-spacing (0.12–0.16em).
- Score-Zahlen sind **neutral** (`{colors.ink}`, Messwert); das Urteilswort
  daneben trägt die `*-ink`-Severity-Farbe (Variante B: Score = Position,
  Urteil = Farbe).

## Layout

- **Container:** `1100px` (`--container`), Lesespalte `720px`
  (`--container-text`), seitliches Padding `clamp(20px, 5vw, 48px)`
  (`--gutter`).
- **Header:** fest `64px` (`--header-h`), mobil (≤719px) `56px`; sticky.
- **Galeriewand-Pattern (Landing):** Sektionen als `.wall`
  (`{colors.page-bg}`, `padding-block: clamp(72px, 11vw, 140px)`), darin
  zentrierte `.tablet`-Tafeln (max-width 760px, 1px `{colors.line}`-Rahmen,
  Radius `--r`, Innen-Padding `clamp(48px, 8vw, 96px)` /
  `clamp(28px, 6vw, 72px)`). Verbindendes Motiv: eine zentrierte
  Mittel-Hairline (`.wall__axis`, 1px breit, `clamp(40px, 7vw, 80px)` hoch)
  oben an jeder Wand-Zone. Tafel-Varianten: `tablet--canvas`,
  `tablet--surface2`, `tablet--ink`; Zonen bewusst OHNE Box (`.open`) für
  reine Weissraum-Momente.
- **Whitespace-Philosophie:** Abstände durchgehend clamp-basiert
  (fliessend zwischen Mobil- und Desktop-Wert statt Breakpoint-Sprüngen) –
  z. B. Hero-Padding `clamp(64px, 12vh, 132px)`, Tafel-Abstände,
  Reveal-Margins.

## Elevation & Depth

Bewusst flach: **KEINE Schatten.** Tiefe entsteht ausschliesslich über
Flächenwechsel:

- Hell: `{colors.page-bg}` (Seite) → `{colors.canvas}` (Karte) →
  `{colors.surface}` (innere Fläche) → `{colors.surface-2}` (eingesenkt).
- Dunkel: `{colors.ink-surface}` (Sektion) → `{colors.ink-surface-2}`
  (abgesetzte Tafel).

Karten sind bordered (Hairlines), nie geschattet. Einzige dokumentierte
Ausnahme: der VerdictCursor trägt einen 1px-Weiss-Halo
(`box-shadow: 0 0 0 1px rgba(255,255,255,0.4)`) als Kontrast-Ring – das ist
ein Ring, keine Tiefen-Illusion.

## Shapes

- **Standard-Radius:** `6px` (`--r`) – «kantig», für Karten, Felder, Buttons,
  Hamburger. Kleinere Radien: `2px` (rounded-tag: Severity-Tags, Score-Bar)
  und `3px` (rounded-chip: Chips, md-Badges). Fokus-Ring-Radius: 2px.
- **Hairline-Borders:** `1px` (`{colors.line}` – Standard-Karten, Trennlinien)
  und `1.5px` (`{colors.ink}` – betonte Rahmen: Buttons, ScoreBar-Track,
  Selected-Tiles, Card border="strong").
- **Dotted Dropzone:** in den hier dokumentierten Quelldateien nicht enthalten
  (Upload-Komponente liegt ausserhalb des gelesenen Umfangs) – siehe Known Gaps.

## Components

**`button`** – eckig, bordered, kein Schatten (cva-Varianten). Basis:
`rounded` (6px), Plex Sans semibold, Transition 120ms,
`disabled`/`aria-disabled` → Opacity 50 % + cursor-not-allowed.

- **primary:** `bg-ink text-surface`, 1.5px `border-ink` · Hover: `bg-ink-soft`.
- **secondary** (Default): `bg-canvas text-ink`, 1.5px `border-ink` ·
  Hover: füllt mit Ink (`bg-ink text-surface`).
- **ghost:** transparent, `text-ink`, Border transparent ·
  Hover: `bg-surface-2`.
- **danger:** `bg-surface text-crit-ink`, 1.5px `border-crit` ·
  Hover: `bg-crit text-surface border-ink`. Nur irreversible Aktionen, sparsam.
- **inverse** (für dunkle Flächen – Header-CTA, Landing-Closer):
  `bg-surface text-ink`, 1.5px `border-surface` ·
  Hover: transparent + `text-surface`.
- **Grössen:** md = min-h 44px, px 16px, py 10px, 14px Text ·
  sm = min-h 38px, px 12px, py 8px, 13px Text.
- **loading:** 14px-Spinner (border-2, border-t-transparent, animate-spin),
  `aria-busy`, Klick gesperrt, Label bleibt sichtbar.

**`badge`** – StatusTag, Mono semibold uppercase, Doppelkodierung Pflicht:
`label` ist das Severity-Wort, nie weglassen. Drei Modi (discriminated union,
TS-erzwungen): `severity` (direkt), `status` (green/yellow/red →
STATUS_TO_SEVERITY gemappt, NIE aus Score gerechnet), `neutral`.

- **safe:** `bg-safe text-surface border-ink` · **warn:** `bg-warn text-ink
  border-ink` · **crit:** `bg-crit text-surface border-ink` ·
  **neutral:** `bg-surface-2 text-ink-soft border-line-strong`.
- **Grössen:** sm = 10px / tracking 0.12em / rounded-tag (2px) ·
  md = 11px / tracking 0.16em / rounded-chip (3px).
- **shape:** `tag` (Default) oder `bracket` (`[ LABEL ]`).

**`card`** – flacher bordered Container, KEIN Schatten, KEIN
Links-Akzent-Streifen. Tiefe nur über Flächenwechsel (tone) + Border.

- **tone:** paper (`bg-canvas`) / surface (`bg-surface`, Default) /
  sunken (`bg-surface-2`).
- **border:** hair (1px `line`, Default) / strong (1.5px `ink`) / none.
- **padding:** none / sm (12px) / md (20px, Default) / lg (28px).

**`chip`** – Tag für visuelle Treiber / normative Aspekte. Mono 11px,
tracking 0.04em, `border-line-strong`, `bg-surface`, rounded-chip,
`text-ink-soft`; optionaler Code-Prefix (10px, `text-muted`).
Bewusst KEINE Severity-Farbe – Chips sind deskriptiv, kein Befund.

**`score-bar`** – horizontaler 0–100-Balken, zwei Varianten:

- **bands** (Default, Druck/ReportPrintView): harte Segmente CRIT/WARN/OK im
  Raster 40fr/30fr/30fr (`{colors.crit}`/`{colors.warn}`/`{colors.safe}`),
  Track 22px hoch (sm: 16px), 1.5px `ink`-Border, Radius 2px;
  Schwellen-Skala als Mono-Kleindruck (0 CRIT · 40 WARN · 70 OK · 100,
  Wörter in `*-ink`).
- **meter** (Frontend 1.1): Track gleichmässig in der **Urteilsfarbe** getönt
  (safe `rgba(44,140,102,0.16)` / warn `rgba(200,146,31,0.18)` /
  crit `rgba(205,66,57,0.16)`) – Färbung vom Urteil, NICHT von der
  Score-Position; Präzisions-Ticks (minor alle 5 %, major alle 25 %),
  Caret-Nadel + Marker-Strich in `{colors.ink}` (neutral).
- **Marker-Motion:** bands 0.6s, meter 340ms Einlauf von 0 auf Score-Position;
  bei `prefers-reduced-motion` oder `animate=false` sofort am Ziel.
  Doppelkodierung über `ariaLabel` (Wort).

**`disclosure`** – aufklappbarer Abschnitt via reka-ui Collapsible
(`aria-expanded` automatisch). Border-top `line`, Trigger Mono 12px semibold
tracking 0.06em `ink-soft`, optionaler Count (`muted`); Chevron rotiert 90°
bei open (150ms, reduced-motion-konform über base.css).

**`tile-select`** – Radiogroup als Kachel-Auswahl. Pflicht-Anzeige als WORT
«Pflicht» (Mono 11px), nicht Asterisk.

- **Default:** min-h 64px, 1.5px `border-line`, `bg-surface`, Radius 6px.
- **Hover:** `border-line-strong` · **Selected:** 1.5px `border-ink` +
  `bg-canvas` (KEIN Links-Streifen) · **Fokus:** 2px `ink`-Outline, Offset 2px.
- **Invalid:** 1.5px `crit`-Outline um die ganze Gruppe (Offset 6px) +
  `role=alert`-Fehlertext in `crit-ink` (12.5px).
- **Disabled:** Opacity 50 %, cursor-not-allowed.
- Spalten: 4 ab 720px, 2 ab 561px, mobil 1.

**`note-block`** – dezenter «Hinweis»-Block (intent/masking/usage).
Box-Variante: `border-line` + `bg-surface-2`, Radius 6px; Mono-Kicker
«Hinweis» (10px, 0.14em) + typspezifischer Suffix; Body 14px `ink-soft`.
`flat`-Variante ohne Box. `content: null` → wird nicht gerendert.
KEIN Links-Streifen; verändert nie Status/Badges.

**`hint-item`** – Befund-Einzeiler mit Severity-Tag (Doppelkodierung):

- **Tag:** high = `bg-crit text-surface` · medium = `bg-warn text-ink` ·
  low = `border-line-strong bg-surface-2 text-ink-soft`; Mono 10px uppercase,
  rounded-tag.
- **Text:** 14px `ink`, optionales Dimension-Label (Mono 10px `subtle`).
- **Details (F5):** concreteFindings (max 2) immer als zugeklapptes
  `<details>` dabei – Summary Mono 11px `muted` mit `+`/`–`-Marker;
  Findings 13px `ink-soft` mit 7px-Quadrat-Marker, eingefärbt nach
  severe (`crit`) / moderate (`warn`) / minor (`surface-2`).

**`dim-badge`** – eine Dimensions-Zelle des Dim-Strips (Variante B):
Label Mono 11px uppercase 0.14em `muted`, optionale Beschreibung Mono 10px
`subtle`; Score-Zahl 34px bold **neutral** (`ink`, Messwert); deutsches
Urteilswort 13px semibold in der `*-ink`-Statusfarbe. Zell-Tönung steuert
der Parent (BefundKarte).

**`app-header`** – globale Kopfzeile, seit Frontend 1.5b **dunkel**
(Ink-Inversion, Ist-Zustand):

- Sticky, `bg: ink-surface`, border-bottom 1px `ink-line`, Höhe
  `--header-h` (64px / mobil 56px).
- **Brand:** Wortmarke 21px / 700 / `ink-text` + Mono-Kicker
  «AI Visual Integrity Check» (10px, 0.14em, `ink-text-muted`, Divider
  1px `ink-line`; mobil ausgeblendet).
- **Nav:** Links 14px / 500 / `ink-text-soft`; Hover `ink-text`;
  aktiv (`aria-current=page`) = `ink-text` + 2px Unterstrich `ink-text` –
  keine Severity-Farbe.
- **CTA «Bild prüfen →»:** Button `variant="inverse"` (entfällt auf /analyze).
- **Demo-Badge:** Badge neutral, lokal auf dunkel umgelegt
  (`ink-surface-2` / `ink-text-soft` / `ink-line`).
- **Fokus-Ring:** lokal auf `ink-text` umgestellt (der globale Ink-Ring wäre
  auf dunkler Fläche unsichtbar).
- **Hamburger (mobil):** 44×44px Touch-Target, `bg: ink-surface-2`,
  1.5px `ink-text`-Border, Radius 6px; Mobile-Panel `ink-surface-2`,
  Links 16px / min-h 44px, Aktivzustand nur font-weight 600.
- REGEL gilt: keine Severity-Wörter/Kleintext auf dieser dunklen Fläche.

**`app-footer`** – heller Fuss: `bg-canvas`, border-top `line`.
Drei Spalten (1.2fr/1fr/1fr, Gap 44px): Selbstbeschreibung ·
Demo-Zugang (BypassCodeField) · Projekt-Links. Spalten-h3 als Mono-Label
(11px / 600 / 0.14em / `subtle`); Body 13px `muted` / 1.6. Bottom-Bar
(border-top `line-soft`) Mono 11px `subtle`. ≤959px: 2-spaltig
(Brand über volle Breite), ≤719px: 1-spaltig. `.no-print`.

### Signature Components

**`hero-mess-raster`** (LandingHero) – monochromes Punktraster auf Canvas,
Mess-/Laborfeld-Anmutung. Raster GAP 30px, Punktradius 1.1px in
`{colors.line}`; im 130px-Cursor-Radius wachsen Punkte bis +2.6px und
wechseln zu `{colors.ink-soft}`, im innersten Bereich (t > 0.62) zu
`{colors.crit}` – die Akzentfarbe nur im unmittelbaren Cursor-Radius.
Rein pointer-getrieben (Redraw nur bei Bewegung, max. 1×/Frame, kein
Dauer-rAF), devicePixelRatio gekappt bei 2, dekorativ (`aria-hidden`).
Reduced-motion ODER Touch/Coarse: statisches Raster, kein Loop.
Darüber: Kicker mit 7px-Ink-Punkt, Hero-Headline mit rotem Satzpunkt
(`{colors.accent}`), Subline, Primär-CTA + Ghost-Link, Mono-Microline.

**`verdict-cursor`** (Dual-State «08») – 30px-Kreis folgt dem Zeiger 1:1
(direktes translate, kein Lerp): 2px `border-line-strong`,
`rgba(255,255,255,0.85)`-Füllung, Zeichen in `{colors.muted}`.
Über `[data-verdict]`-Zonen wird er zum Verdikt: **✓** (`{colors.safe}`) /
**✕** (`{colors.crit}`), sonst neutraler Punkt **·**. Nur auf
hover+fine-Geräten initialisiert; `elementFromPoint` nur bei
Pointer-Bewegung; Formularfelder behalten den nativen Cursor (Kreis blendet
aus); Farb-/Opacity-Transition 0.12s, bewusst KEINE transform-Transition
(Hit-Test-Synchronität); reduced-motion: keine Transition.

**`befund-karte`** (4-Block, grob) – zentrale Ergebnis-Karte, rendert
ausschliesslich aus dem AnalysisViewModel. Vier Blöcke (Inverted Pyramid):
**1 Gesamturteil** (Status-Tag + Headline mit Akzent-Satzpunkt + ScoreBar
meter) → **2 Diagnose auf einen Blick** (Dim-Strip mit DimBadges) →
**3 Was jetzt zu tun ist** (Hints/Notes) → **4 Warum dieses Urteil?**
(Disclosure-Vertiefung). Status NUR aus `overallVerdict.status`, nie aus dem
Score neu berechnet; Score-Zahl + Marker neutral, Urteilsfarbe über Tag +
dezente Flächen-Tönung; kein v-html.

**`dunkle-landing-sektionen`** – zwei bewusst dunkle Momente der Landing:
«Die Maskierung» (`.wall--ink`: `ink-surface`-Grund, `tablet--ink` mit
`ink-surface-2` + `ink-line`-Rahmen, Texte in `ink-text`/`ink-text-soft`/
`ink-text-muted`) und der Schluss-CTA (`.closer`: `ink-surface`, Headline
mit dem einzigen roten Verdikt-Punkt der Wand-Sektionen, CTA
`variant="inverse"`). Im Druck werden beide hell bzw. ausgeblendet.

**`landing-bildstellen`** – die Landing trägt genau zwei Bilder (KI-generierte
Beispielmotive, WebP unter `public/landing/`), bewusst nicht mehr:
(1) das **Specimen** (LandingSpecimen): echter Galeriedruck im Passepartout –
`canvas`-Mat mit `line`-Rahmen, Bild mit 1.5px `line-strong`-Innenrahmen,
Mono-Museumskärtchen («KI-generiert · bewusst ohne Befund»);
(2) das **Wirkung/Detail-Paar** (`.pair`) in der Maskierungs-Tafel: dasselbe
Pressefoto als Gesamtansicht und als CSS-Zoom-Crop (`transform: scale(2.6)` im
`overflow: hidden`-Frame, aspect-ratio 4/3, kein zweiter Download) auf die
fehlerhaften Mikrofon-Logos – die Maskierungs-These als Bild. Captions Mono
uppercase in `{colors.ink-text-muted}`, neutral formuliert (keine
Severity-Wörter auf dunkler Fläche); im Druck Farben auf helle Töne
nachgeführt, `.pair__item` bricht nicht über Seiten.

## Motion

«Ruhig, nichts Nervöses» – Animationen sind dezent und kurz.

- **Reveal («sanftes Eintreten», useReveal):** IntersectionObserver
  (threshold 0.2, rootMargin `0px 0px -8% 0px`), gestaffeltes Einmal-Fade
  pro Tafel (`opacity 0 → 1`, `translateY(8px)`, 0.5s ease, Staffel-Delays
  0.07s/0.14s/0.21s; Specimen: 0.6s, 12px). Reines Enhancement: die
  Versteck-Styles greifen erst mit der Klasse `reveal-ready` (JS) – ohne JS
  ist alles sofort sichtbar. Tastatur-Fokus (`:focus-within`) macht ein noch
  nicht enthülltes Element sofort sichtbar.
- **0.12s-Konvention:** Interaktions-Transitions ~120ms ease-out
  (Button-Hover, Header-Nav, VerdictCursor, TileSelect); Link-Unterstrich
  0.16s, Disclosure-Chevron 150ms, ScoreBar-Marker 0.6s (bands) / 340ms
  (meter), Inline-Link-Pfeil 0.14s.
- **Canvas pointer-getrieben, kein Dauer-rAF:** Hero-Raster und
  VerdictCursor fordern Frames NUR aus pointermove an (Dirty-Flag, max.
  1 Update/Frame); ohne Bewegung fällt keine Arbeit an.
- **prefers-reduced-motion:** base.css setzt global alle Animationen/
  Transitions auf 0.01ms; zusätzlich komponentenlokal: Hero-Canvas statisch
  (kein Pointer-Tracking), ScoreBar-Marker ohne Transition sofort am Ziel,
  Reveals sofort sichtbar (`opacity:1 !important`), VerdictCursor ohne
  Farb-Transition.

## Do's and Don'ts

### Do

- **Tokens statt Hex** – Farben ausschliesslich über `var(--…)` bzw. die
  Tailwind-Token-Klassen; `tokens.css` ist die einzige Quelle der Wahrheit.
- **Doppelkodierung Farbe + Wort** – Severity nie nur farblich; das Wort
  (OK/WARN/CRIT bzw. Urteilswort) steht immer dabei und darf nie vom Score
  getrennt umbrechen.
- **Hairlines** – 1px/1.5px-Borders für Rahmen und Trennung; Betonung über
  Flächenwechsel, vollflächigen Rahmen oder Typo-Hierarchie.
- **Rote Verdikt-Punkte nur als gesetzte Momente** – der Akzent-Satzpunkt
  sitzt an wenigen, bewussten Stellen (auf der Landing: Hero-Satzpunkt und
  Schluss-CTA; dazu der flüchtige Akzent im Hero-Raster bei
  Pointer-Interaktion). Nie als wiederholtes Dekor-Element streuen.
- **Mono-Kicker uppercase mit letter-spacing** (0.12–0.16em) für Eyebrows,
  Labels, Captions, Daten.

### Don't (harte Projektregeln)

- **NIEMALS Karten mit farbigem Akzent-Streifen an der linken Kante** – in
  keiner Form: kein `border-left`, kein absolut positionierter
  `::before`/`::after`-Streifen, kein inset-`box-shadow`, egal in welcher
  Farbe oder Dicke.
- **Keine Severity-Farben für Wörter oder Kleintext auf dunklen Flächen** –
  `{colors.crit}` erreicht auf `{colors.ink-surface}` nur ~3.3:1; der rote
  Punkt ist als Grafik ok, als Textfarbe nicht. Neutraler Kleintext in den
  `--ink-text-*`-Tönen bleibt erlaubt.
- **Keine zweite Akzentfarbe** – `--accent` und `--crit` sind derselbe Hex
  (#cd4239); das System kennt genau einen chromatischen Akzent.
- **Keine Schatten/Gradients auf Karten** – Tiefe nur über Flächenwechsel;
  «kein Gradient-als-Idee» (Landing-Kommentar).
- **Kein LLM-Fliesstext in der Hauptansicht** – das Frontend übersetzt JSON
  in visuelle Komponenten; Reasoning nur in der Vertiefung.
- **Keine Garantie-Begriffe in UI-Texten** – «Validator», «erkennt
  zuverlässig» u. ä. sind abgeschwächt (F4-Entscheid: Kicker = «AI Visual
  Integrity Check»); Befunde sind Hinweise, keine Urteile.
- **Halbgeviertstrich – statt Geviertstrich —** in allen Texten (auch der
  Disclosure-/Details-Marker nutzt U+2013).

## Responsive Behavior

| Breakpoint | Verhalten |
|:---|:---|
| ≤560px | TileSelect 1-spaltig |
| ≥561px | TileSelect 2-spaltig |
| ≤719px | Mobil: Header 56px, Brand-Kicker ausgeblendet, Desktop-Nav + Header-Actions weg, Hamburger (44px Touch-Target) + Mobile-Panel; Hero-CTAs full-width gestapelt; Landing-Lead zentriert; Footer 1-spaltig; LandingDimensions-Zeilen stapeln (Score+Wort bleiben zusammen) |
| ≥720px | Hauptbreakpoint Desktop: Header 64px mit Nav + CTA, TileSelect 4-spaltig |
| ≤959px | Footer 2-spaltig (Brand über volle Breite) |

Geräteklassen statt Breite: auf `hover: none` / `pointer: coarse` wird die
Canvas-Interaktion des Hero-Rasters deaktiviert (statisches Raster) und der
VerdictCursor gar nicht erst initialisiert (nativer Cursor).

## Iteration Guide

1. **Tokens referenzieren, nie duplizieren** – neue Farben/Radien gehören in
   `app/assets/css/tokens.css` (einzige Quelle), das Tailwind-Mapping spiegelt
   nur per `var()`.
2. **Eine Komponente pro Iteration** – chirurgische Änderungen, jede Zeile
   muss sich auf den Auftrag zurückführen lassen.
3. **Nach jeder Änderung:** `cd frontend && npx nuxi typecheck` (deckt auch
   den server-Layer ab; `vue-tsc --project` ist oberflächlich).
4. **Neue UI-Texte** gegen die F4-Checkliste prüfen:
   `Konzept_Frontend/umsetzung-1.5/framing-und-transparenz.md`
   (keine Garantie-Begriffe, Hinweis statt Nachweis, Du-Ansprache).

## Known Gaps

- **Kein vollständiges Dark-Mode-Konzept.** Die Ink-Inversion
  (`--ink-*`-Tokens) existiert nur für den App-Header und zwei
  Landing-Sektionen («Die Maskierung», Schluss-CTA) – es gibt keinen
  globalen Dark Mode (Tailwind `darkMode: 'class'` ist konfiguriert, wird
  aber nicht bedient).
- **Kein Logo.** Die Brand ist eine reine Wortmarke (Backlog B1).
- **Print-Ansicht nur teilweise auf 1.5-Stand.** base.css liefert die
  Druck-Basis (weisser Grund, exakte Ampel-Farben, @page-Ränder 16mm/14mm),
  die Landing blendet dunkle Sektionen aus – eine vollständige
  1.5-Überarbeitung der ReportPrintView steht aus (Backlog B3).
- **Animations-Timings nicht systematisiert.** Ausser der 0.12s-Konvention
  für Interaktions-Transitions existiert keine zentrale Timing-Skala – die
  real verwendeten Werte streuen (0.14s, 0.16s, 150ms, 340ms, 0.5s, 0.6s).
- **Dotted Dropzone nicht belegt.** Die Upload-/Dropzone-Komponente liegt
  ausserhalb der hier dokumentierten Quelldateien; ihr Stil (dotted Border)
  ist in diesem Sheet nicht mit Werten belegt.

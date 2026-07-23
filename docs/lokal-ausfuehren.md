# Lokal ausführen

Diese Anleitung beschreibt, wie SemantIC lokal aufgesetzt und benutzt wird: das Produkt-Frontend (Nuxt 4) starten und die Analyse-Pipeline über die Kommandozeile testen.

Das Repo besteht aus zwei npm-Projekten, die getrennt installiert werden:

- **Root** (`package.json`) – die framework-agnostische Analyse-Pipeline (`src/`) inklusive CLI-Test-Script `spike`.
- **`frontend/`** (`frontend/package.json`) – das Nuxt-4-Frontend, das die Pipeline über eine Server-Route konsumiert.

## Voraussetzungen

- **Node.js** – Node `^20.19.0 || >=22.12.0` (Vorgabe von Nuxt 4; im Projekt mit Node 22 getestet).
- **npm** – als Paketmanager (im Projekt gesetzt).

## Installation

```bash
# Repository klonen
git clone https://github.com/Dune005/SemantIC
cd SemantIC

# Pipeline-Abhängigkeiten im Root installieren
npm install

# Frontend-Abhängigkeiten installieren
cd frontend
npm install
```

Beim Frontend-Install wird über das `postinstall`-Script (`nuxt prepare`) automatisch der Nuxt-Typkontext generiert.

## Umgebungsvariablen

Die Schlüssel werden lokal aus einer `.env.local` im Repo-Root geladen:

- Das CLI lädt `.env.local` direkt (`src/cli.ts`).
- Das Frontend lädt im Dev-Betrieb ebenfalls `../.env.local` aus dem Repo-Root (`frontend/nuxt.config.ts`). Auf Vercel zählen stattdessen die im Dashboard hinterlegten Environment-Variablen.

Lege die Datei auf Basis der Vorlage `.env.example` an (im Repo-Root ausführen – wer noch in `frontend/` steht, wechselt zuerst mit `cd ..` zurück):

```bash
cd ..   # falls noch in frontend/ – zurück in den Repo-Root
cp .env.example .env.local
# anschliessend die Werte in .env.local eintragen
```

> **Wichtig:** `.env.local` enthält Secrets und gehört nicht ins Versionskontroll-System. Prüfe, dass sie in `.gitignore` steht.

| Variable | Wofür |
|:---|:---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | API-Key für Google Gemini (primäres LLM, Bildanalyse-Call). |
| `ANTHROPIC_API_KEY` | API-Key für Anthropic Claude (Ästhetik-Score-Call; Default-Provider für die Ästhetik-Bewertung). |
| `UPSTASH_REDIS_REST_URL` | Endpunkt der Upstash-Redis-Instanz für das IP-basierte Rate-Limit (Frontend-Middleware). |
| `UPSTASH_REDIS_REST_TOKEN` | Zugriffs-Token für dieselbe Upstash-Redis-Instanz. |
| `SEMANTIC_BYPASS_CODE` | Einlöse-Code für den Rate-Limit-Bypass (Demo-Zugang). Nur nötig, wenn der Bypass genutzt werden soll. |
| `SEMANTIC_BYPASS_SECRET` | Server-Geheimnis, mit dem der Rate-Limit-Bypass abgesichert wird. Verlässt den Server nie. |
| `OPENROUTER_API_KEY` | Optional: nur nötig, wenn Analyse- oder Ästhetik-Call über OpenRouter laufen soll (`--model` bzw. `--aesthetic-model` mit `openrouter:…`-Prefix). |
| `MODAL_AESTHETIC_URL` / `MODAL_AESTHETIC_BEARER` | Optional: Endpunkt + Token für einen externen Ästhetik-Nebencall. Fehlt die Konfiguration, läuft die Analyse ohne diesen Zusatzwert weiter. |
| `MODAL_CLIP_URL` / `MODAL_CLIP_BEARER` | Optional: Endpunkt + Token für den CLIP-Abgleich von Prompt/Kontext gegen das Bild. Fehlt die Konfiguration, wird der Schritt übersprungen. |
| `SEMANTIC_DEBUG_RAW` | Optional (Debug): Wert `1` aktiviert das Roh-Logging der LLM-Antworten auch in Produktion. |

> **Hinweis zum Rate-Limit:** Ohne gesetzte Upstash-Keys fällt das Rate-Limit im Dev-Betrieb offen aus – Anfragen werden also nicht begrenzt. Für reines lokales Entwickeln und Testen der Analyse ist das in Ordnung; für eine produktionsnahe Prüfung des Limits müssen die Upstash-Variablen gesetzt sein.

## Frontend starten

Alle Befehle aus dem `frontend/`-Verzeichnis (Scripts aus `frontend/package.json`):

```bash
cd frontend

# Entwicklungs-Server
npm run dev

# Produktions-Build
npm run build
```

Der Dev-Server läuft auf einem eigenen Port, damit er nicht mit anderen lokalen Projekten kollidiert: **Port `3500`** (gesetzt in `frontend/nuxt.config.ts`). Aufruf also unter `http://localhost:3500`.

Weitere in `frontend/package.json` vorhandene Scripts: `npm run preview` (Vorschau des Builds), `npm run generate` (statische Generierung).

## Pipeline per CLI testen

Die Analyse-Pipeline lässt sich ohne Frontend direkt auf ein einzelnes Bild anwenden. Das Script `spike` liegt im **Repo-Root** (`package.json`) und ruft `src/cli.ts` über `tsx` auf.

Grundform (Argumente nach `--` werden an das CLI durchgereicht):

```bash
npm run spike -- <bildpfad> [flags]
```

Das erste Argument ist der Pfad zum Bild. Unterstützte Endungen laut `src/cli.ts`: `.jpg`, `.jpeg`, `.png`, `.webp`. AVIF-Dateien werden erkannt und mit einem Konvertierungshinweis abgewiesen.

### Verfügbare Flags

Alle Flags stammen direkt aus `src/cli.ts`:

| Flag | Werte / Beispiel | Bedeutung |
|:---|:---|:---|
| `--prompt` | `"..."` (Freitext) | Original-Prompt des Bildes (ermöglicht die Ableitung der Bias-Achsen). |
| `--context` | `"..."` (Freitext) | Nutzungskontext des Bildes (spezifischere Bias-Bewertung). |
| `--intent` | `affirmative` \| `critical` \| `illustrative` \| `unspecified` | Erklärte redaktionelle Haltung (Default: `unspecified`). Beeinflusst nur die Rahmung der Empfehlung, nicht die Codebook-Flags oder den Verdict-Status. |
| `--model` | `"<provider:model>"` | Modell für den Analyse-Call. Steuert nur die Analyse, nicht den Ästhetik-Call. |
| `--aesthetic-model` | `"<provider:model>"` | Modell für den Ästhetik-Call. Überschreibt nur diesen Call. |
| `--lang` | `de` \| `en` | Sprache des Analyse-Prompts (Default: `en`). |
| `--output-lang` | `de` \| `en` | Sprache der Report-Freitexte (Findings, Reasonings, Hinweise). Default: `de`. |
| `--temperature` | Zahl zwischen `0` und `2`, z. B. `0.1` | Sampling-Temperatur des Modells. |
| `--thinking-level` | `minimal` \| `low` \| `medium` \| `high` | Gemini-spezifisch; greift nur, wenn der Analyse-Call gegen Gemini läuft. |
| `--media-resolution` | `unspecified` \| `low` \| `medium` \| `high` | Gemini-spezifisch; Auflösungsstufe der Bildverarbeitung. |

### Hinweise aus dem Code

- `--model` steuert **nur** den Analyse-Call. Der Ästhetik-Call läuft per Default gegen `anthropic:claude-sonnet-5` (bewusst gewählter Default für feinere Ästhetik-Differenzierung) und lässt sich mit `--aesthetic-model` gezielt überschreiben.
- Die Sprachsteuerung hat zwei unabhängige Achsen: `--lang` wählt die Sprache des Analyse-Prompts (Default `en`, weil der englische Prompt mit Gemini die stabilere Erkennung liefert). `--output-lang` steuert davon unabhängig die Sprache der Report-Freitexte (Default `de`).
- `--thinking-level` und `--media-resolution` sind Gemini-spezifisch und wirken nur bei einem Gemini-Analyse-Call.

### Ausgabe

Das CLI gibt das formatierte Ergebnis in der Konsole aus und speichert zusätzlich das vollständige JSON unter `spike-test/output/` (Dateiname mit Zeitstempel).

### Beispiele

```bash
# Minimaler Lauf nur mit Bild
npm run spike -- ./pfad/zum/bild.jpg

# Mit Prompt und Nutzungskontext
npm run spike -- ./pfad/zum/bild.jpg \
  --prompt "ein Arzt im Krankenhausflur" \
  --context "Symbolbild für einen Gesundheitsartikel"

# Deutscher Prompt, anderes Analyse-Modell, niedrige Temperatur
npm run spike -- ./pfad/zum/bild.jpg \
  --lang de \
  --model "gemini-3-flash-preview" \
  --temperature 0.1
```

## Deployment

Das Deployment läuft über **Vercel**. Das Vercel-**Root-Verzeichnis** ist `frontend/` – nur dieses Projekt wird gebaut und deployt. Die benötigten Environment-Variablen (siehe oben) werden im Vercel-Dashboard hinterlegt, nicht über `.env.local`.

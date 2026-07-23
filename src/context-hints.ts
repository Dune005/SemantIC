import type { OutputLang } from './vocab.js'

export interface ContextReviewHint {
  id: string
  severity: 'low' | 'medium' | 'high'
  triggeredBy: string[]
  hint: string
  reviewQuestion: string
}

interface HintInput {
  readingMode: string
  visualDrivers: string[]
  physicsScore: number
  semanticsScore: number
  biasScore: number
  aestheticScore: number
  hasUsageContext: boolean
  biasFlags: {
    hasGenderBias: boolean
    hasRoleStereotype: boolean
    hasBodyStereotype: boolean
  }
  codebookFlags: {
    hasPhysicsIssue: boolean
    hasAnatomyIssue: boolean
    hasContextIssue: boolean
  }
}

// Hint-Texte zweisprachig (outputLang-Achse, 2026-07-20). Die Regel-Logik ist
// unverändert; nur die Textausgabe folgt der Report-Sprache. EN-Wording gleich
// vorsichtig wie DE (Hinweis, kein Nachweis – Modalverben, keine Wirkungs-
// Behauptungen).
type L10n = Record<OutputLang, string>

const HINT_TEXTS: Record<string, { hint: L10n; reviewQuestion: L10n }> = {
  visual_overload: {
    hint: {
      de: 'Das Bild kombiniert mehrere starke visuelle Treiber. Prüfen, ob die Darstellung für den Nutzungskontext zu unruhig, zu dekorativ oder zu aufmerksamkeitsstark ist.',
      en: 'The image combines several strong visual drivers. Check whether the presentation is too busy, too decorative, or too attention-grabbing for the usage context.',
    },
    reviewQuestion: {
      de: 'Unterstützt die visuelle Dichte die Aussage des Beitrags oder lenkt sie davon ab?',
      en: 'Does the visual density support the message of the piece, or does it distract from it?',
    },
  },
  stock_aesthetic_risk: {
    hint: {
      de: 'Das Bild folgt einer Werbe- oder Magazin-Ästhetik mit hoher Oberflächenqualität. Bei journalistischen, fachlichen oder dokumentarischen Kontexten prüfen, ob die Darstellung zu glatt oder zu generisch wirkt.',
      en: 'The image follows an advertising or magazine aesthetic with high surface quality. For journalistic, professional, or documentary contexts, check whether the presentation looks too polished or too generic.',
    },
    reviewQuestion: {
      de: 'Passt der visuelle Stil zur beabsichtigten Kommunikation, oder wirkt das Bild wie ein austauschbares Stockfoto?',
      en: 'Does the visual style fit the intended communication, or does the image look like an interchangeable stock photo?',
    },
  },
  role_stereotype_review: {
    hint: {
      de: 'Die Darstellung enthält eine soziale Rolle mit möglicher Stereotypisierung. Prüfen, ob Rollenbesetzung, Handlungsmacht und Bildkomposition die intendierte Aussage stützen oder stereotype Muster verstärken.',
      en: 'The image depicts a social role with possible stereotyping. Check whether role casting, agency, and composition support the intended message or reinforce stereotypical patterns.',
    },
    reviewQuestion: {
      de: 'Reproduziert die Darstellung stereotype Erwartungen, oder bildet sie die gewünschte Realität ab?',
      en: 'Does the portrayal reproduce stereotypical expectations, or does it depict the intended reality?',
    },
  },
  context_missing: {
    hint: {
      de: 'Ohne Nutzungskontext kann SemantIC nur Bildmerkmale beurteilen. Die redaktionelle Passung muss manuell geprüft werden.',
      en: 'Without a usage context, SemantIC can only assess image characteristics. The editorial fit has to be checked manually.',
    },
    reviewQuestion: {
      de: 'In welchem Kontext soll dieses Bild verwendet werden, und passt die Darstellung dazu?',
      en: 'In which context is this image meant to be used, and does the presentation fit it?',
    },
  },
  physics_finding_review: {
    hint: {
      de: 'Das Modell hat einen Physik-Befund markiert (Licht, Schatten, Material, Perspektive, Spiegelung oder Text). Prüfen, ob der Befund im Bild visuell nachvollziehbar ist und wie kritisch er für den Nutzungskontext wirkt.',
      en: 'The model marked a physics finding (light, shadow, material, perspective, reflection, or text). Check whether the finding is visually verifiable in the image and how critical it is for the usage context.',
    },
    reviewQuestion: {
      de: 'Ist der markierte Physik-Befund im Bild tatsächlich sichtbar und störend für den Nutzungskontext?',
      en: 'Is the marked physics finding actually visible in the image and disruptive for the usage context?',
    },
  },
  anatomy_finding_review: {
    hint: {
      de: 'Das Modell hat einen Anatomie-Befund markiert (Hände, Finger, Gesicht, Proportionen oder Gliedmassen). Diese Kategorie wird in den Tests teilweise overused — vorsichtig prüfen, ob ein konkreter Fehler belegbar ist.',
      en: 'The model marked an anatomy finding (hands, fingers, face, proportions, or limbs). In testing, this category is sometimes overused — check carefully whether a concrete defect can be verified.',
    },
    reviewQuestion: {
      de: 'Liegt ein konkreter, sichtbarer Anatomiefehler vor, oder ist es ein „uncanny valley"-Eindruck ohne klares Detail?',
      en: 'Is there a concrete, visible anatomical defect, or is it an “uncanny valley” impression without a clear detail?',
    },
  },
  context_finding_review: {
    hint: {
      de: 'Das Modell hat einen Kontext- oder Szenenlogik-Befund markiert (Objekt am falschen Ort, Raumlogik oder Prompt-Mismatch). Kontextfehler sind für die redaktionelle Prüfung oft kritischer als Physikfehler — Beobachtung ernst nehmen und gegen den Nutzungskontext spiegeln. Hinweis: subtile Kontextfehler ohne offensichtliche Szenen-Marker werden vom Modell teilweise nicht erkannt — auch ohne diesen Hinweis aktiv prüfen.',
      en: 'The model marked a context or scene-logic finding (object in the wrong place, room logic, or prompt mismatch). For editorial review, context errors are often more critical than physics errors — take the observation seriously and weigh it against the usage context. Note: subtle context errors without obvious scene markers are sometimes missed by the model — check actively even without this hint.',
    },
    reviewQuestion: {
      de: 'Passt die dargestellte Szene logisch zum Prompt und Nutzungskontext, oder gibt es einen funktionalen Bruch?',
      en: 'Does the depicted scene logically fit the prompt and usage context, or is there a functional break?',
    },
  },
}

export function deriveContextReviewHints(input: HintInput, lang: OutputLang = 'de'): ContextReviewHint[] {
  const hints: ContextReviewHint[] = []
  const texts = (id: keyof typeof HINT_TEXTS) => ({
    hint: HINT_TEXTS[id]!.hint[lang],
    reviewQuestion: HINT_TEXTS[id]!.reviewQuestion[lang],
  })

  if (input.visualDrivers.length >= 4) {
    hints.push({
      id: 'visual_overload',
      severity: 'medium',
      triggeredBy: input.visualDrivers,
      ...texts('visual_overload'),
    })
  }

  if (['WA', 'MI'].includes(input.readingMode) && input.aestheticScore >= 80) {
    hints.push({
      id: 'stock_aesthetic_risk',
      severity: 'medium',
      triggeredBy: [input.readingMode, `aesthetic_combined:${input.aestheticScore}`],
      ...texts('stock_aesthetic_risk'),
    })
  }

  // Der frühere Hint 'masking_attention_risk' (aesthetic >= 80 + Dimension < 60)
  // wurde entfernt (2026-06-10, Codex-Review): Schwellen-Differenz Ästhetik vs.
  // Integrität war genau die widerlegte Score-Logik. Maskierung kommuniziert
  // jetzt ausschliesslich das evidenz-gegatete masking_review_note (masking-note.ts).

  if (input.biasFlags.hasGenderBias || input.biasFlags.hasRoleStereotype || input.biasFlags.hasBodyStereotype) {
    const triggers: string[] = []
    if (input.biasFlags.hasGenderBias) triggers.push('gender_bias')
    if (input.biasFlags.hasRoleStereotype) triggers.push('role_stereotype')
    if (input.biasFlags.hasBodyStereotype) triggers.push('body_stereotype')
    hints.push({
      id: 'role_stereotype_review',
      severity: 'medium',
      triggeredBy: triggers,
      ...texts('role_stereotype_review'),
    })
  }

  if (!input.hasUsageContext) {
    hints.push({
      id: 'context_missing',
      severity: 'low',
      triggeredBy: ['no_usage_context'],
      ...texts('context_missing'),
    })
  }

  if (input.codebookFlags.hasPhysicsIssue) {
    hints.push({
      id: 'physics_finding_review',
      severity: 'medium',
      triggeredBy: ['has_physics_issue', `physics:${input.physicsScore}`],
      ...texts('physics_finding_review'),
    })
  }

  if (input.codebookFlags.hasAnatomyIssue) {
    hints.push({
      id: 'anatomy_finding_review',
      severity: 'medium',
      triggeredBy: ['has_anatomy_issue'],
      ...texts('anatomy_finding_review'),
    })
  }

  if (input.codebookFlags.hasContextIssue) {
    hints.push({
      id: 'context_finding_review',
      severity: 'high',
      triggeredBy: ['has_context_issue', `semantics:${input.semanticsScore}`],
      ...texts('context_finding_review'),
    })
  }

  return hints
}

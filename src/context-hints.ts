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

export function deriveContextReviewHints(input: HintInput): ContextReviewHint[] {
  const hints: ContextReviewHint[] = []

  if (input.visualDrivers.length >= 4) {
    hints.push({
      id: 'visual_overload',
      severity: 'medium',
      triggeredBy: input.visualDrivers,
      hint: 'Das Bild kombiniert mehrere starke visuelle Treiber. Prüfen, ob die Darstellung für den Nutzungskontext zu unruhig, zu dekorativ oder zu aufmerksamkeitsstark ist.',
      reviewQuestion: 'Unterstützt die visuelle Dichte die Aussage des Beitrags oder lenkt sie davon ab?',
    })
  }

  if (['WA', 'MI'].includes(input.readingMode) && input.aestheticScore >= 80) {
    hints.push({
      id: 'stock_aesthetic_risk',
      severity: 'medium',
      triggeredBy: [input.readingMode, `aesthetic_combined:${input.aestheticScore}`],
      hint: 'Das Bild folgt einer Werbe- oder Magazin-Ästhetik mit hoher Oberflächenqualität. Bei journalistischen, fachlichen oder dokumentarischen Kontexten prüfen, ob die Darstellung zu glatt oder zu generisch wirkt.',
      reviewQuestion: 'Passt der visuelle Stil zur beabsichtigten Kommunikation, oder wirkt das Bild wie ein austauschbares Stockfoto?',
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
      hint: 'Die Darstellung enthält eine soziale Rolle mit möglicher Stereotypisierung. Prüfen, ob Rollenbesetzung, Handlungsmacht und Bildkomposition die intendierte Aussage stützen oder stereotype Muster verstärken.',
      reviewQuestion: 'Reproduziert die Darstellung stereotype Erwartungen, oder bildet sie die gewünschte Realität ab?',
    })
  }

  if (!input.hasUsageContext) {
    hints.push({
      id: 'context_missing',
      severity: 'low',
      triggeredBy: ['no_usage_context'],
      hint: 'Ohne Nutzungskontext kann SemantIC nur Bildmerkmale beurteilen. Die redaktionelle Passung muss manuell geprüft werden.',
      reviewQuestion: 'In welchem Kontext soll dieses Bild verwendet werden, und passt die Darstellung dazu?',
    })
  }

  if (input.codebookFlags.hasPhysicsIssue) {
    hints.push({
      id: 'physics_finding_review',
      severity: 'medium',
      triggeredBy: ['has_physics_issue', `physics:${input.physicsScore}`],
      hint: 'Das Modell hat einen Physik-Befund markiert (Licht, Schatten, Material, Perspektive, Spiegelung oder Text). Prüfen, ob der Befund im Bild visuell nachvollziehbar ist und wie kritisch er für den Nutzungskontext wirkt.',
      reviewQuestion: 'Ist der markierte Physik-Befund im Bild tatsächlich sichtbar und störend für den Nutzungskontext?',
    })
  }

  if (input.codebookFlags.hasAnatomyIssue) {
    hints.push({
      id: 'anatomy_finding_review',
      severity: 'medium',
      triggeredBy: ['has_anatomy_issue'],
      hint: 'Das Modell hat einen Anatomie-Befund markiert (Hände, Finger, Gesicht, Proportionen oder Gliedmassen). Diese Kategorie wird in den Tests teilweise overused — vorsichtig prüfen, ob ein konkreter Fehler belegbar ist.',
      reviewQuestion: 'Liegt ein konkreter, sichtbarer Anatomiefehler vor, oder ist es ein „uncanny valley"-Eindruck ohne klares Detail?',
    })
  }

  if (input.codebookFlags.hasContextIssue) {
    hints.push({
      id: 'context_finding_review',
      severity: 'high',
      triggeredBy: ['has_context_issue', `semantics:${input.semanticsScore}`],
      hint: 'Das Modell hat einen Kontext- oder Szenenlogik-Befund markiert (Objekt am falschen Ort, Raumlogik oder Prompt-Mismatch). Kontextfehler sind für die redaktionelle Prüfung oft kritischer als Physikfehler — Beobachtung ernst nehmen und gegen den Nutzungskontext spiegeln. Hinweis: subtile Kontextfehler ohne offensichtliche Szenen-Marker werden vom Modell teilweise nicht erkannt — auch ohne diesen Hinweis aktiv prüfen.',
      reviewQuestion: 'Passt die dargestellte Szene logisch zum Prompt und Nutzungskontext, oder gibt es einen funktionalen Bruch?',
    })
  }

  return hints
}

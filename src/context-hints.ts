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
      hint: 'Das Bild kombiniert mehrere starke visuelle Treiber. Pruefen, ob die Darstellung fuer den Nutzungskontext zu unruhig, zu dekorativ oder zu aufmerksamkeitsstark ist.',
      reviewQuestion: 'Unterstuetzt die visuelle Dichte die Aussage des Beitrags oder lenkt sie davon ab?',
    })
  }

  if (['WA', 'MI'].includes(input.readingMode) && input.aestheticScore >= 80) {
    hints.push({
      id: 'stock_aesthetic_risk',
      severity: 'medium',
      triggeredBy: [input.readingMode, `aesthetic:${input.aestheticScore}`],
      hint: 'Das Bild folgt einer Werbe- oder Magazin-Aesthetik mit hoher Oberflaechenqualitaet. Bei journalistischen, fachlichen oder dokumentarischen Kontexten pruefen, ob die Darstellung zu glatt oder zu generisch wirkt.',
      reviewQuestion: 'Passt der visuelle Stil zur beabsichtigten Kommunikation, oder wirkt das Bild wie ein austauschbares Stockfoto?',
    })
  }

  if (input.aestheticScore >= 80 && (input.physicsScore < 60 || input.semanticsScore < 60 || input.biasScore < 60)) {
    const weakDims: string[] = []
    if (input.physicsScore < 60) weakDims.push(`physics:${input.physicsScore}`)
    if (input.semanticsScore < 60) weakDims.push(`semantics:${input.semanticsScore}`)
    if (input.biasScore < 60) weakDims.push(`bias:${input.biasScore}`)
    hints.push({
      id: 'masking_attention_risk',
      severity: 'high',
      triggeredBy: [`aesthetic:${input.aestheticScore}`, ...weakDims],
      hint: 'Die visuelle Oberflaeche ist stark, waehrend einzelne Integritaetsdimensionen auffaellig sind. Die Aesthetik koennte vorhandene Fehler ueberdecken.',
      reviewQuestion: 'Fallen die identifizierten Probleme beim normalen Betrachten auf, oder werden sie durch die visuelle Qualitaet maskiert?',
    })
  }

  if (input.biasFlags.hasGenderBias || input.biasFlags.hasRoleStereotype || input.biasFlags.hasBodyStereotype) {
    const triggers: string[] = []
    if (input.biasFlags.hasGenderBias) triggers.push('gender_bias')
    if (input.biasFlags.hasRoleStereotype) triggers.push('role_stereotype')
    if (input.biasFlags.hasBodyStereotype) triggers.push('body_stereotype')
    hints.push({
      id: 'role_stereotype_review',
      severity: 'medium',
      triggeredBy: triggers,
      hint: 'Die Darstellung enthaelt eine soziale Rolle mit moeglicher Stereotypisierung. Pruefen, ob Rollenbesetzung, Handlungsmacht und Bildkomposition die intendierte Aussage stuetzen oder stereotype Muster verstaerken.',
      reviewQuestion: 'Reproduziert die Darstellung stereotype Erwartungen, oder bildet sie die gewuenschte Realitaet ab?',
    })
  }

  if (!input.hasUsageContext) {
    hints.push({
      id: 'context_missing',
      severity: 'low',
      triggeredBy: ['no_usage_context'],
      hint: 'Ohne Nutzungskontext kann SemantIC nur Bildmerkmale beurteilen. Die redaktionelle Passung muss manuell geprueft werden.',
      reviewQuestion: 'In welchem Kontext soll dieses Bild verwendet werden, und passt die Darstellung dazu?',
    })
  }

  if (input.codebookFlags.hasPhysicsIssue) {
    hints.push({
      id: 'physics_finding_review',
      severity: 'medium',
      triggeredBy: ['has_physics_issue', `physics:${input.physicsScore}`],
      hint: 'Das Modell hat einen Physik-Befund markiert (Licht, Schatten, Material, Perspektive, Spiegelung oder Text). Pruefen, ob der Befund im Bild visuell nachvollziehbar ist und wie kritisch er fuer den Nutzungskontext wirkt.',
      reviewQuestion: 'Ist der markierte Physik-Befund im Bild tatsaechlich sichtbar und stoerend fuer den Nutzungskontext?',
    })
  }

  if (input.codebookFlags.hasAnatomyIssue) {
    hints.push({
      id: 'anatomy_finding_review',
      severity: 'medium',
      triggeredBy: ['has_anatomy_issue'],
      hint: 'Das Modell hat einen Anatomie-Befund markiert (Haende, Finger, Gesicht, Proportionen oder Gliedmassen). Diese Kategorie wird in den Tests teilweise overused — vorsichtig pruefen, ob ein konkreter Fehler belegbar ist.',
      reviewQuestion: 'Liegt ein konkreter, sichtbarer Anatomiefehler vor, oder ist es ein "uncanny valley"-Eindruck ohne klares Detail?',
    })
  }

  if (input.codebookFlags.hasContextIssue) {
    hints.push({
      id: 'context_finding_review',
      severity: 'high',
      triggeredBy: ['has_context_issue', `semantics:${input.semanticsScore}`],
      hint: 'Das Modell hat einen Kontext- oder Szenenlogik-Befund markiert (Objekt am falschen Ort, Raumlogik oder Prompt-Mismatch). Kontextfehler sind fuer die redaktionelle Pruefung oft kritischer als Physikfehler — Beobachtung ernst nehmen und gegen den Nutzungskontext spiegeln. Hinweis: subtile Kontextfehler ohne offensichtliche Szenen-Marker werden vom Modell teilweise nicht erkannt — auch ohne diesen Hinweis aktiv pruefen.',
      reviewQuestion: 'Passt die dargestellte Szene logisch zum Prompt und Nutzungskontext, oder gibt es einen funktionalen Bruch?',
    })
  }

  return hints
}

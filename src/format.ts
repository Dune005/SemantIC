import type { SemanticAnalysisResult } from './analyze.js'

export function formatResult(result: SemanticAnalysisResult): string {
  const { analysis, aesthetic, computed, meta } = result
  const { dimension_analysis: dim, research_layer: rl, bias_axis_analysis: baa, integrity_score_llm } = analysis

  const lines: string[] = []

  lines.push('═══ SemantIC Analyse ═══')
  lines.push('')

  lines.push('Scores')
  lines.push(`  Integrity:       ${computed.integrity_score_local}/100  (lokal berechnet)`)
  lines.push(`  Ästhetik Sonnet: ${aesthetic.aesthetic_score}/100`)
  if (meta.laion_aesthetic) {
    const l = meta.laion_aesthetic
    const oor = l.out_of_range ? ' [out_of_range]' : ''
    lines.push(`  Ästhetik V2.5:   ${l.normalized}/100  (raw ${l.raw_score.toFixed(2)}/10 via ${l.model}${oor}, ${l.duration_ms}ms)`)
  } else if (meta.laion_aesthetic_error) {
    lines.push(`  Ästhetik V2.5:   – (Fehler: ${meta.laion_aesthetic_error})`)
  }
  const combinedNote = computed.aesthetic_combined_source === 'sonnet+v25'
    ? '(Mittel aus Sonnet + V2.5)'
    : '(nur Sonnet — V2.5 nicht verfügbar)'
  lines.push(`  Ästhetik kombiniert: ${computed.aesthetic_combined}/100  ${combinedNote}`)
  if (aesthetic.aesthetic_reasoning) {
    lines.push(`  Begründung Ästhetik (Sonnet): ${aesthetic.aesthetic_reasoning}`)
  }
  lines.push('')

  lines.push('Dimensionen')
  lines.push(`  Physik:    ${dim.physics.score}/100  [${dim.physics.status}]`)
  lines.push(`  Semantik:  ${dim.semantics.score}/100  [${dim.semantics.status}]`)
  lines.push(`  Bias:      ${dim.bias.score}/100  [${dim.bias.status}]`)
  lines.push('')

  const cb = rl.codebook
  const flag = (v: boolean) => v ? '⚠ Befund' : '– kein Befund'
  const formatBox = (box: number[]) => `[y${box[0]} x${box[1]} → y${box[2]} x${box[3]}]`
  const evidenceLines = (label: string, isSet: boolean, evidence: typeof cb.physics_evidence) => {
    lines.push(`  ${label.padEnd(9)} ${flag(isSet)}`)
    if (isSet && evidence.length > 0) {
      evidence.forEach((e, i) => {
        lines.push(`              ${i + 1}. ${formatBox(e.region_box_2d)}`)
        lines.push(`                 ${e.specific_observation}`)
      })
    }
  }
  lines.push('Codebook-Befunde (Modell-Markierung mit Pixel-Anker, kein Nachweis)')
  evidenceLines('Physik:', cb.has_physics_issue, cb.physics_evidence)
  evidenceLines('Anatomie:', cb.has_anatomy_issue, cb.anatomy_evidence)
  evidenceLines('Kontext:', cb.has_context_issue, cb.context_evidence)
  if (meta.evidence_filter && (meta.evidence_filter.downgraded_flags.length > 0 || meta.evidence_filter.dropped_evidence_count > 0)) {
    lines.push('')
    lines.push('  [R4.1 Evidence-Filter]')
    if (meta.evidence_filter.downgraded_flags.length > 0) {
      lines.push(`    Flags ohne valide Evidenz auf false gesetzt: ${meta.evidence_filter.downgraded_flags.join(', ')}`)
    }
    if (meta.evidence_filter.dropped_evidence_count > 0) {
      lines.push(`    ${meta.evidence_filter.dropped_evidence_count} invalide Evidence-Einträge entfernt`)
    }
  }
  lines.push('')

  lines.push('Maskierungs-Hinweis (beschreibend, deterministisch komponiert – kein Score)')
  if (result.masking_review_note) {
    const note = result.masking_review_note
    lines.push(`  ${note.text}`)
    lines.push(`  Basis: Leseart ${note.basis.reading_mode} · Treiber ${note.basis.visual_drivers.join(', ')} · ${note.basis.link_count} Verknüpfung(en)`)
    rl.masking_evidence.forEach((e, i) => {
      const salience = e.salient_region ? 'salient' : 'peripher'
      lines.push(`  ${i + 1}. Treiber ${e.driver} könnte ${e.codebook_link}-Befund überdecken (${salience}, conf=${e.confidence})`)
      lines.push(`     Region: ${formatBox(e.region_box_2d)}`)
      lines.push(`     ${e.masked_issue}`)
    })
  } else {
    lines.push('  Kein Maskierungs-Hinweis: keine validen Treiber↔Befund-Verknüpfungen markiert.')
  }
  if (meta.masking_filter && meta.masking_filter.dropped_evidence_count > 0) {
    lines.push('')
    lines.push('  [R4.2 Masking-Filter]')
    lines.push(`    ${meta.masking_filter.dropped_evidence_count} invalide Einträge entfernt (${meta.masking_filter.drop_reasons.join('; ')})`)
  }
  lines.push('')

  const clip = meta.clip_alignment
  const clipError = meta.clip_alignment_error
  lines.push('Bild↔Text-Alignment (CLIP, Modal)')
  if (clipError) {
    lines.push(`  – (Fehler: ${clipError})`)
  } else if (!clip) {
    lines.push('  – (nicht verfügbar)')
  } else if (clip.skipped) {
    lines.push('  – (kein Text-Input)')
  } else {
    const fmt = (cos: number | null) => cos === null ? '–' : cos.toFixed(3)
    const tag = (truncated: boolean, tokenCount: number) =>
      truncated ? `${tokenCount} Tokens, gekürzt` : `${tokenCount} Tokens`
    lines.push(`  Prompt-Cosine:   ${fmt(clip.prompt_cosine).padEnd(6)}  (${tag(clip.prompt_truncated, clip.prompt_token_count)})`)
    lines.push(`  Context-Cosine:  ${fmt(clip.context_cosine).padEnd(6)}  (${tag(clip.context_truncated, clip.context_token_count)})`)
    lines.push(`  Modell: ${clip.model}  (${clip.duration_ms}ms)`)
    lines.push('  Hinweis: Roh-Cosine, kein Score. Typischer Bereich 0.10–0.35.')
  }
  lines.push('')

  lines.push('Normative Bildwirkung (analytische Einordnung, keine Bewertung)')
  lines.push(`  Verdict: ${rl.normative_masking.verdict}`)
  if (rl.normative_masking.aspects.length > 0) {
    lines.push(`  Aspekte: ${rl.normative_masking.aspects.join(', ')}`)
  }
  if (rl.normative_masking.reasoning) {
    lines.push(`  Begründung: ${rl.normative_masking.reasoning}`)
  }
  lines.push('')

  const drivers = rl.visual_drivers.length > 0 ? rl.visual_drivers.join(', ') : '–'
  lines.push('Research Layer')
  lines.push(`  Leseart:              ${rl.reading_mode} – ${rl.reading_mode_label}`)
  lines.push(`  Visuelle Treiber:     ${drivers}`)
  lines.push(`  Fehlertyp (LLM):     ${rl.dominant_error_type}`)
  lines.push('')

  const provenance = rl.provenance_markers ?? []
  lines.push('Sichtbare Bildmarkierungen (deskriptiv – Overlay wie Wasserzeichen/Logo/Signatur, kein Echtheitsurteil)')
  if (provenance.length === 0) {
    lines.push('  Keine sichtbaren Overlay-Markierungen erfasst.')
  } else {
    provenance.forEach((m, i) => {
      lines.push(`  ${i + 1}. ${m.type} ${formatBox(m.region_box_2d)} (conf=${m.confidence})`)
      lines.push(`     ${m.description}`)
    })
  }
  lines.push('')

  if (baa.axes.length > 0) {
    lines.push(`TIBET Bias-Achsen (${baa.axes.length})`)
    baa.axes.forEach((axis, i) => {
      lines.push(`  ${i + 1}. ${axis.axis_id} (${axis.relevance}) – ${axis.reason_for_relevance}`)
    })
  } else {
    lines.push('TIBET Bias-Achsen (0)')
    lines.push(`  ${baa.no_axes_reason ?? '–'}`)
  }
  lines.push('')

  const llmScore = integrity_score_llm.score
  const localScore = computed.integrity_score_local
  const delta = Math.abs(llmScore - localScore)
  lines.push('Validierung')
  lines.push(`  LLM Integrity: ${llmScore}  |  Lokal berechnet: ${localScore}  |  Delta: ${delta}`)
  lines.push('')

  const hints = result.context_review_hints ?? []
  lines.push(`Redaktionelle Pruefhinweise (${hints.length}) – Hinweise, kein Nachweis`)
  if (hints.length === 0) {
    lines.push('  Keine Auffaelligkeiten.')
  } else {
    hints.forEach(h => {
      lines.push(`  [${h.severity}] ${h.hint}`)
      lines.push(`    → ${h.reviewQuestion}`)
    })
  }
  lines.push('')

  const aestheticModel = meta.aesthetic_model ?? meta.model
  lines.push(`Modell (Analyse):   ${meta.model}`)
  lines.push(`Modell (Ästhetik):  ${aestheticModel}`)
  lines.push(`Laufzeit: ${meta.duration_ms} ms`)
  if (meta.test_config) {
    const cfg = meta.test_config
    const parts = [
      cfg.temperature !== undefined ? `temperature=${cfg.temperature}` : undefined,
      cfg.thinkingLevel ? `thinkingLevel=${cfg.thinkingLevel}` : undefined,
      cfg.mediaResolution ? `mediaResolution=${cfg.mediaResolution}` : undefined,
    ].filter(Boolean)
    lines.push(`Test-Konfiguration: ${parts.join('  |  ')}`)
  }

  return lines.join('\n')
}

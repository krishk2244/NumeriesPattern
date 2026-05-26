export type NumerologySystem = 'pythagorean' | 'chaldean'

/**
 * Picker-state for the System toggle. `'both'` means "match under both
 * systems simultaneously" — used downstream as an intersection filter.
 * Stays separate from `NumerologySystem` so calculateName() never has to
 * special-case it.
 */
export type SystemSelection = NumerologySystem | 'both'

export function expandSelection(sel: SystemSelection): NumerologySystem[] {
  return sel === 'both' ? ['pythagorean', 'chaldean'] : [sel]
}

export interface LetterResult {
  char: string
  value: number | null
  isSpace: boolean
}

export interface CalculationResult {
  letters: LetterResult[]
  sum: number
  reductionSteps: number[]
  finalNumber: number
  systemName: string
}

export interface NumberMeaning {
  title: string
  archetype: string
  keywords: string[]
  description: string
  planet: string
  color: string
}

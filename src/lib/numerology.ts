import type { NumerologySystem, LetterResult, CalculationResult } from '@/types/numerology'
import { PYTHAGOREAN_MAP, CHALDEAN_MAP } from './constants'

export function getMap(system: NumerologySystem): Record<string, number> {
  return system === 'pythagorean' ? PYTHAGOREAN_MAP : CHALDEAN_MAP
}

export function reduceToPrimary(n: number): number[] {
  const steps: number[] = [n]
  while (n > 9) {
    n = String(n)
      .split('')
      .reduce((acc, d) => acc + parseInt(d), 0)
    steps.push(n)
  }
  return steps
}

export function calculateName(
  name: string,
  system: NumerologySystem
): CalculationResult {
  const map = getMap(system)
  const upper = name.toUpperCase()
  const letters: LetterResult[] = []
  let sum = 0

  for (const char of upper) {
    if (char === ' ') {
      letters.push({ char, value: null, isSpace: true })
    } else {
      const value = map[char] ?? null
      if (value !== null) sum += value
      letters.push({ char, value, isSpace: false })
    }
  }

  const reductionSteps = reduceToPrimary(sum)

  return {
    letters,
    sum,
    reductionSteps,
    finalNumber: reductionSteps[reductionSteps.length - 1],
    systemName: system === 'pythagorean' ? 'Pythagorean' : 'Chaldean',
  }
}

/**
 * Calculate a mobile / phone number's numerology by summing all digits and
 * reducing to a single digit (1–9). Non-digit characters render as visible
 * separator slots but contribute zero — mirrors how `calculateName` treats
 * spaces.
 */
export function calculateMobile(input: string): CalculationResult {
  const letters: LetterResult[] = []
  let sum = 0

  for (const char of input) {
    if (char >= '0' && char <= '9') {
      const value = parseInt(char, 10)
      sum += value
      letters.push({ char, value, isSpace: false })
    } else if (
      char === ' ' ||
      char === '-' ||
      char === '(' ||
      char === ')' ||
      char === '+' ||
      char === '.'
    ) {
      letters.push({ char, value: null, isSpace: true })
    }
    // anything else is silently dropped
  }

  const reductionSteps = reduceToPrimary(sum)

  return {
    letters,
    sum,
    reductionSteps,
    finalNumber: reductionSteps[reductionSteps.length - 1],
    systemName: 'Mobile',
  }
}

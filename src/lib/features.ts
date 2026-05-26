/**
 * Feature flags read from environment variables. Server-side only.
 *
 *   FEATURE_SUGGEST_ENABLED   — Name Atelier  (/suggest)
 *   FEATURE_FOUNDRY_ENABLED   — Company Foundry (/foundry)
 *
 * Default behaviour when the variable is unset (or any non-disabled value):
 * the feature is ENABLED. Local dev runs without setting anything → both on.
 *
 * To hide a feature in production, set the env var to one of:
 *   "off" | "false" | "0" | "disabled"
 * on Railway via:
 *   railway variables --set FEATURE_SUGGEST_ENABLED=off --service numeris
 */

const DISABLED_VALUES = new Set(['off', 'false', '0', 'disabled', 'no'])

function isEnvDisabled(name: string): boolean {
  const v = process.env[name]
  if (!v) return false
  return DISABLED_VALUES.has(v.toLowerCase().trim())
}

export function isSuggestEnabled(): boolean {
  return !isEnvDisabled('FEATURE_SUGGEST_ENABLED')
}

export function isFoundryEnabled(): boolean {
  return !isEnvDisabled('FEATURE_FOUNDRY_ENABLED')
}

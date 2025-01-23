export function validateBotDeduplicationKey(key: string | null | undefined) {
  return !!key?.match(/^2025-\d{2}-\d{2}.*/);
}

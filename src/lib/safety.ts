// Lightweight, robust safety & UGC validation for username display and profanity filtering

const BANNED_PATTERNS = [
  'fuck', 'shit', 'asshole', 'bitch', 'nigger', 'nigga', 'cunt', 'dick', 'cock', 'pussy',
  'whore', 'slut', 'faggot', 'bastard', 'nazi', 'hitler', 'porn', 'pedophile', 'rape',
  'sikis', 'pic', 'amk', 'yarrak', 'orospu', 'got', 'kahpe', 'arschloch', 'schlampe', 'hure'
];

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/!/g, 'i')
    .replace(/[^a-z0-9]/g, ''); // remove non-alphanumeric
}

export function isProfane(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const normalized = normalizeText(text);
  if (!normalized) return false;

  for (const banned of BANNED_PATTERNS) {
    if (normalized.includes(banned)) {
      return true;
    }
  }
  return false;
}

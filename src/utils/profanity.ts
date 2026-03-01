// A basic dictionary of foul language in English and Indonesian.
// Using a Set for quick lookups, but we will primarily use word-boundary regex matching.
const BAD_WORDS = [
  // English
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'slut', 'whore',
  'faggot', 'nigger', 'motherfucker', 'cock', 'piss', 'crap', 'bullshit', 'douchebag',
  // Indonesian
  'anjing', 'babi', 'monyet', 'bangsat', 'keparat', 'goblok', 'tolol', 'bego', 'idiot',
  'bajingan', 'kampret', 'sialan', 'tai', 'perek', 'lonte', 'ngentot', 'kontol', 'memek',
  'pantek', 'asu', 'jancok', 'dancok', 'jembut', 'pepek'
];

/**
 * Checks if the given text contains any words from the BAD_WORDS list.
 * Uses word-boundary matching to prevent false positives (e.g. 'bass' matching 'ass').
 */
export function hasProfanity(text: string): boolean {
  if (!text) return false;
  
  // Normalize text: lowercase, and remove common leetspeak character replacements
  // This is a basic normalization, can be expanded if needed.
  let normalizedText = text.toLowerCase();
  
  // Create a regex pattern that matches any of the bad words as whole words
  // The \b asserts that a word boundary must exist before and after the word
  const pattern = new RegExp(`\\b(${BAD_WORDS.join('|')})\\b`, 'i');
  
  return pattern.test(normalizedText);
}

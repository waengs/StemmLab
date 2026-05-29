const AMBIGUOUS_WORDS = [
  'shit', 'dick', 'cock', 'piss', 'crap', 'twat', 
  'babi', 'bego', 'tai', 'asu'
];

const SEVERE_WORDS = [
  'fuck', 'fucking', 'fucker', 'fucked', 'shitty', 'bitch', 'asshole', 'cunt', 'pussy', 'bastard', 'slut', 'whore',
  'faggot', 'nigger', 'nigga', 'motherfucker', 'bullshit', 'douchebag', 'retard', 'wanker',
  'anjing', 'njing', 'monyet', 'bangsat', 'keparat', 'goblok', 'tolol', 'idiot',
  'bajingan', 'kampret', 'sialan', 'perek', 'lonte', 'ngentot', 'kontol', 'memek',
  'pantek', 'jancok', 'dancok', 'jembut', 'pepek', 'kimak', 'peler'
];

/**
 * Checks if the given text contains any words from the profanity lists.
 * Uses a two-pass system to prevent false positives while remaining strict.
 */
export function hasProfanity(text: string): boolean {
  if (!text) return false;
  
  // 1. Basic normalization and leetspeak replacement
  let normalizedText = text.toLowerCase()
    .replace(/@/g, 'a').replace(/4/g, 'a')
    .replace(/\$/g, 's').replace(/5/g, 's')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i').replace(/!/g, 'i')
    .replace(/3/g, 'e')
    .replace(/7/g, 't').replace(/\+/g, 't')
    .replace(/8/g, 'b');

  // PASS 1: AMBIGUOUS WORDS
  // Keep spaces/punctuation intact and enforce word boundaries (\b) 
  // so we don't flag "class" (ass), "detail" (tai), or "casual" (asu).
  const ambiguousPatterns = AMBIGUOUS_WORDS.map(word => word.split('').map(char => char + '+').join(''));
  const ambiguousRegex = new RegExp(`\\b(${ambiguousPatterns.join('|')})\\b`, 'i');
  if (ambiguousRegex.test(normalizedText)) {
    return true;
  }
  
  // PASS 2: SEVERE WORDS
  // Strip all punctuation and spaces so we can catch words hidden across gaps (e.g. f u c k)
  // We use substring matching (no \b) because these words rarely appear innocently inside other words.
  const squishedText = normalizedText.replace(/[.\-\s+,!?"'|/\\;:]/g, '');
  const severePatterns = SEVERE_WORDS.map(word => word.split('').map(char => char + '+').join(''));
  const severeRegex = new RegExp(`(${severePatterns.join('|')})`, 'i');
  
  return severeRegex.test(squishedText);
}

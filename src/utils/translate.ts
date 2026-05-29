/**
 * Uses the free MyMemory Translation API to translate text.
 * Note: Free usage is limited to 500 words/day.
 * @param text The text to translate
 * @param targetLang The ISO 639-1 language code to translate into (e.g. 'en', 'id')
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text;
  
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      const translated = data.responseData.translatedText;
      
      // MyMemory returns this specific string if the source and target language are the same
      if (translated.includes('PLEASE SELECT TWO DISTINCT LANGUAGES') || translated.includes('IS AN INVALID TARGET LANGUAGE')) {
        return text;
      }
      
      return translated;
    }
    return text; // Fallback to original text if translation fails
  } catch (error) {
    console.warn('Translation error:', error);
    return text; // Fallback to original on network failure
  }
}

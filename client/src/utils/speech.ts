import type { Language } from '../types';

// ============================================================
// Web Speech API Wrapper — per AGENTS.md specification
// ============================================================

const LANG_MAP: Record<Language, string> = {
  kn: 'kn-IN',
  hi: 'hi-IN',
  en: 'en-IN',
};

export function speakText(text: string, language: Language): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_MAP[language];
  utterance.rate = 0.85; // slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.cancel(); // stop any current speech
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}

export function speakRecommendations(
  recommendations: { voiceText?: string; description: { en: string; hi: string; kn: string } }[],
  language: Language,
): void {
  const texts = recommendations.map(r => r.voiceText ?? r.description[language]);
  speakText(texts.join('. '), language);
}

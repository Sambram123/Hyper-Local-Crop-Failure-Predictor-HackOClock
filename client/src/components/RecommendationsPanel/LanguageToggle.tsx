import type { LanguageToggleProps } from '../../types';

const LANGUAGES: { code: 'en' | 'hi' | 'kn'; label: string; native: string }[] = [
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'hi', label: 'HI', native: 'हिंदी' },
  { code: 'kn', label: 'KN', native: 'ಕನ್ನಡ' },
];

export default function LanguageToggle({ value, onChange, size = 'md' }: LanguageToggleProps) {
  return (
    <div
      className="lang-toggle"
      role="group"
      aria-label="Language selector"
      style={{ fontSize: size === 'sm' ? '0.8rem' : '0.875rem' }}
    >
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          id={`lang-toggle-${lang.code}`}
          className={`lang-btn ${value === lang.code ? 'active' : ''}`}
          onClick={() => onChange(lang.code)}
          title={lang.native}
          aria-pressed={value === lang.code}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'nl', name: 'Nederlands', flag: 'NL' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('erp-matcher-language', langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-language-selector"
        >
          <Globe className="h-5 w-5" />
          <span className="sr-only">{t('nav.selectLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`cursor-pointer gap-2 ${
              currentLanguage.code === lang.code ? 'bg-accent' : ''
            }`}
            data-testid={`language-option-${lang.code}`}
          >
            <span className="text-base">{getFlagEmoji(lang.flag)}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const isHe = i18n.language === 'he'

  const toggle = (lang: string) => {
    i18n.changeLanguage(lang)
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggle('en')}
        className={cn(
          'px-2 py-1 text-sm rounded-lg border transition-colors',
          !isHe
            ? 'bg-[#2C2C2C] text-[#F5F5F5] border-[#2C2C2C]'
            : 'bg-[#E3E3E3] text-[#1E1E1E] border-[#767676]'
        )}
      >
        {t('header.lang_en')}
      </button>
      <button
        onClick={() => toggle('he')}
        className={cn(
          'px-2 py-1 text-sm rounded-lg border transition-colors',
          isHe
            ? 'bg-[#2C2C2C] text-[#F5F5F5] border-[#2C2C2C]'
            : 'bg-[#E3E3E3] text-[#1E1E1E] border-[#767676]'
        )}
      >
        {t('header.lang_he')}
      </button>
    </div>
  )
}

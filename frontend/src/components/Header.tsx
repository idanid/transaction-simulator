import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { LanguageToggle } from './LanguageToggle'
import shvaLogo from '@/assets/shva-logo.png'

export function Header() {
  const { t } = useTranslation()
  const { email, logout } = useAuthStore()

  return (
    <header
      className="flex flex-row flex-wrap items-center px-8 border-b border-[#D9D9D9] bg-white"
      style={{ height: '99px', gap: '0 24px' }}
    >
      <div className="flex-none">
        <img src={shvaLogo} alt="Shva" className="h-[35px] w-auto" />
      </div>

      <div className="flex-1 flex justify-end items-center gap-3">
        {email && (
          <button
            onClick={logout}
            className="text-sm text-[#49454F] hover:text-[#1E1E1E] transition-colors"
          >
            {t('auth.logout')}
          </button>
        )}
        <LanguageToggle />
      </div>
    </header>
  )
}

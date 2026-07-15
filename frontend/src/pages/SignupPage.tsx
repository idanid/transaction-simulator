import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'
import shvaLogo from '@/assets/shva-logo.png'

export function SignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await authService.register(email, password)
      setAuth(data.token, data.email)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? t('toast.error')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7FF] px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#D9D9D9] p-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={shvaLogo} alt="Shva" className="h-10 w-auto" />
        </div>
        <h1 className="font-inter font-semibold text-2xl text-[#1E1E1E] text-center mb-6">
          {t('auth.signup_title')}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#49454F] font-inter">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#D9D9D9] rounded-lg px-4 py-2.5 text-sm text-[#1E1E1E] outline-none
                         focus:border-[#65558F] focus:ring-1 focus:ring-[#65558F] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[#49454F] font-inter">{t('auth.password')}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[#D9D9D9] rounded-lg px-4 py-2.5 text-sm text-[#1E1E1E] outline-none
                         focus:border-[#65558F] focus:ring-1 focus:ring-[#65558F] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 bg-[#65558F] text-white rounded-lg font-inter font-medium text-sm
                       hover:bg-[#4f4070] disabled:opacity-60 transition-colors"
          >
            {loading ? '...' : t('auth.signup_btn')}
          </button>
        </form>
        <p className="text-center text-sm text-[#49454F] mt-4">
          <Link to="/login" className="text-[#65558F] hover:underline">
            {t('auth.go_login')}
          </Link>
        </p>
      </div>
    </div>
  )
}

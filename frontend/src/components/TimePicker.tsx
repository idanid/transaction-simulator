import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (time: string) => void
  onConfirm?: () => void
  onCancel?: () => void
  locked?: boolean
}

export function TimePicker({ value, onChange, onConfirm, onCancel, locked = false }: Props) {
  const { t } = useTranslation()
  const [activeField, setActiveField] = useState<'hour' | 'minute'>('hour')

  const split = (v: string) => {
    const parts = (v ?? '').split(':')
    return { h: parts[0] ?? '', m: parts[1] ?? '' }
  }

  const [tempHour, setTempHour] = useState(() => split(value).h)
  const [tempMinute, setTempMinute] = useState(() => split(value).m)

  useEffect(() => {
    const { h, m } = split(value)
    setTempHour(h)
    setTempMinute(m)
  }, [value])

  const handleOk = () => {
    const h = (tempHour || '0').padStart(2, '0')
    const m = (tempMinute || '0').padStart(2, '0')
    onChange(`${h}:${m}`)
    onConfirm?.()
  }

  const handleCancel = () => {
    const { h, m } = split(value)
    setTempHour(h)
    setTempMinute(m)
    onCancel?.()
  }

  const sanitizeHour = (v: string) => {
    const n = parseInt(v, 10)
    if (isNaN(n)) return ''
    return Math.min(23, Math.max(0, n)).toString().padStart(2, '0')
  }

  const sanitizeMinute = (v: string) => {
    const n = parseInt(v, 10)
    if (isNaN(n)) return ''
    return Math.min(59, Math.max(0, n)).toString().padStart(2, '0')
  }

  return (
    <div
      className="flex flex-col gap-5 rounded-[28px] select-none transition-colors"
      style={{ width: '328px', background: locked ? '#ECE6F0' : '#D6CCE7', padding: '0' }}
    >
      {/* Header */}
      <div className="px-6 pt-6">
        <span className="text-[#49454F] font-roboto font-medium text-xs tracking-[0.5px]">
          {t('dashboard.time_label')}
        </span>
      </div>

      {/* Hour + Minute — always LTR so hour is always left, minute always right */}
      <div
        className="flex justify-center items-start px-6 gap-3"
        dir="ltr"
        style={{ pointerEvents: locked ? 'none' : 'auto' }}
      >
        {/* Hour */}
        <div className="flex flex-col items-center gap-[7px] flex-1">
          <div
            onClick={() => setActiveField('hour')}
            className={cn(
              'flex justify-center items-center rounded-lg transition-colors w-full h-[72px]',
              locked
                ? 'bg-[#EADDFF] border-2 border-[#65558F] cursor-default'
                : cn(
                    'cursor-pointer',
                    activeField === 'hour'
                      ? 'bg-[#EADDFF] border-2 border-[#65558F]'
                      : 'bg-[#E6E0E9]'
                  )
            )}
          >
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={tempHour}
              readOnly={locked}
              tabIndex={locked ? -1 : 0}
              onChange={(e) => setTempHour(e.target.value.replace(/\D/g, ''))}
              onBlur={() => !locked && setTempHour(sanitizeHour(tempHour))}
              onFocus={(e) => { if (!locked) { setActiveField('hour'); e.target.select() } }}
              className={cn(
                'text-center font-roboto font-normal text-[45px] leading-[52px] bg-transparent outline-none w-16',
                locked
                  ? 'text-[#21005D] cursor-default'
                  : activeField === 'hour' ? 'text-[#21005D]' : 'text-[#1D1B20]'
              )}
              placeholder="00"
            />
          </div>
          <span className="text-[#49454F] font-roboto text-xs tracking-[0.4px]">
            {t('dashboard.time_hour')}
          </span>
        </div>

        {/* Separator */}
        <span className="font-roboto font-normal text-[57px] text-[#1D1B20] leading-[72px]">
          :
        </span>

        {/* Minute */}
        <div className="flex flex-col items-center gap-[7px] flex-1">
          <div
            onClick={() => setActiveField('minute')}
            className={cn(
              'flex justify-center items-center rounded-lg transition-colors w-full h-[72px]',
              locked
                ? 'bg-[#EADDFF] border-2 border-[#65558F] cursor-default'
                : cn(
                    'cursor-pointer',
                    activeField === 'minute'
                      ? 'bg-[#EADDFF] border-2 border-[#65558F]'
                      : 'bg-[#E6E0E9]'
                  )
            )}
          >
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={tempMinute}
              readOnly={locked}
              tabIndex={locked ? -1 : 0}
              onChange={(e) => setTempMinute(e.target.value.replace(/\D/g, ''))}
              onBlur={() => !locked && setTempMinute(sanitizeMinute(tempMinute))}
              onFocus={(e) => { if (!locked) { setActiveField('minute'); e.target.select() } }}
              className={cn(
                'text-center font-roboto font-normal text-[45px] leading-[52px] bg-transparent outline-none w-16',
                locked
                  ? 'text-[#21005D] cursor-default'
                  : activeField === 'minute' ? 'text-[#21005D]' : 'text-[#1D1B20]'
              )}
              placeholder="00"
            />
          </div>
          <span className="text-[#49454F] font-roboto text-xs tracking-[0.4px]">
            {t('dashboard.time_minute')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center px-3 pb-5" dir="ltr">
        {/* Left icon: checkmark when locked, clock when editable */}
        <div className="w-10 h-10 flex items-center justify-center rounded-full">
          {locked
            ? <Check size={20} className="text-[#65558F]" />
            : <Clock size={24} className="text-[#49454F]" />
          }
        </div>

        <div className="flex gap-2">
          {/* Cancel always visible — unlocks when locked */}
          <button
            onClick={handleCancel}
            className="px-3 py-2 rounded-full font-roboto font-medium text-sm text-[#65558F] hover:bg-[#65558F]/10 transition-colors"
          >
            {t('dashboard.time_cancel')}
          </button>

          {/* OK only visible when not locked */}
          {!locked && (
            <button
              onClick={handleOk}
              className="px-3 py-2 rounded-full font-roboto font-medium text-sm text-[#65558F] hover:bg-[#65558F]/10 transition-colors"
            >
              {t('dashboard.time_ok')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

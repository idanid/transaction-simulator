import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const REGIONS = ['France', 'Israel', 'Cyprus', 'Italy']

interface Props {
  value: string
  onChange: (region: string) => void
}

export function RegionSelector({ value, onChange }: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = REGIONS.filter((r) =>
    r.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    setQuery(value ? t(`regions.${value}`) : '')
  }, [value, t])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative w-[200px]">
      {/* MD3-style text field */}
      <div
        className={cn(
          'relative border rounded-sm transition-colors',
          open ? 'border-[3px] border-[#65558F]' : 'border border-[#D9D9D9]'
        )}
      >
        {/* Floating label */}
        <span
          className={cn(
            'absolute bg-white px-1 text-xs transition-all pointer-events-none',
            open || query
              ? '-top-2 start-3 text-[#65558F] text-[11px]'
              : 'top-3 start-4 text-[#49454F] text-sm'
          )}
        >
          {t('dashboard.region_label')}
        </span>
        <div className="flex items-center px-4 pt-4 pb-1 gap-1">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={open ? t('dashboard.region_placeholder') : ''}
            className="flex-1 text-sm text-[#1D1B20] bg-transparent outline-none min-w-0"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); onChange(''); setOpen(false) }}
              className="text-[#49454F] hover:text-[#1E1E1E]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-[#D9D9D9] rounded-sm shadow-md mt-1">
          {filtered.map((region) => (
            <button
              key={region}
              onClick={() => { onChange(region); setQuery(t(`regions.${region}`)); setOpen(false) }}
              className="w-full text-start px-4 py-2 text-sm text-[#1D1B20] hover:bg-[#F5F5F5] transition-colors"
            >
              {t(`regions.${region}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

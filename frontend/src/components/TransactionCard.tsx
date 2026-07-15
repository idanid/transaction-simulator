import { useTranslation } from 'react-i18next'
import type { ApprovedTransaction } from '@/types'

interface Props {
  transaction: ApprovedTransaction
}

export function TransactionCard({ transaction }: Props) {
  const { t } = useTranslation()

  return (
    <div className="border border-[#D9D9D9] rounded-lg bg-white p-6 w-[280px] shrink-0">
      <div className="flex flex-col gap-1" dir="auto">
        <span className="font-inter font-semibold text-2xl text-[#1E1E1E] leading-tight">
          {t('dashboard.card_time')} {transaction.localTime}
        </span>
        <span className="font-inter font-normal text-base text-[#1E1E1E]">
          {t('dashboard.card_timezone')} {transaction.region}
        </span>
      </div>
    </div>
  )
}

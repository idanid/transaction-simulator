import { create } from 'zustand'
import type { ApprovedTransaction, TransactionResult } from '@/types'
import { transactionService } from '@/services/transaction.service'

interface TransactionState {
  selectedRegion: string
  selectedTime: string
  approvedTransactions: ApprovedTransaction[]
  isSubmitting: boolean
  isFetching: boolean
  lastResult: TransactionResult | null
  setRegion: (region: string) => void
  setTime: (time: string) => void
  submitTransaction: () => Promise<TransactionResult>
  fetchApproved: () => Promise<void>
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  selectedRegion: '',
  selectedTime: '',
  approvedTransactions: [],
  isSubmitting: false,
  isFetching: false,
  lastResult: null,

  setRegion: (region) => set({ selectedRegion: region }),
  setTime: (time) => set({ selectedTime: time }),

  submitTransaction: async () => {
    const { selectedRegion, selectedTime } = get()
    set({ isSubmitting: true, lastResult: null })
    try {
      const result = await transactionService.submit(selectedRegion, selectedTime)
      set({ lastResult: result })
      if (result.status === 'Approved') {
        await get().fetchApproved()
      }
      return result
    } finally {
      set({ isSubmitting: false })
    }
  },

  fetchApproved: async () => {
    set({ isFetching: true })
    try {
      const data = await transactionService.getApproved()
      set({ approvedTransactions: data })
    } finally {
      set({ isFetching: false })
    }
  },
}))

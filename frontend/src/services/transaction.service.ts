import api from './api'
import type { ApprovedTransaction, TransactionResult } from '@/types'

export const transactionService = {
  submit: (region: string, time: string) =>
    api
      .post<TransactionResult>('/transactions/submit', { region, time })
      .then((r) => r.data),

  getApproved: () =>
    api.get<ApprovedTransaction[]>('/transactions/approved').then((r) => r.data),

  getCurrentTime: (region: string) =>
    api
      .get<{ time: string }>(`/transactions/current-time/${region}`)
      .then((r) => r.data.time),
}

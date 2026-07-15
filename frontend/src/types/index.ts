export interface User {
  email: string
}

export interface AuthResponse {
  token: string
  email: string
}

export interface TransactionResult {
  status: 'Approved' | 'Rejected'
  localTime: string
  region: string
}

export interface ApprovedTransaction {
  id: number
  region: string
  localTime: string
  submittedAtUtc: string
}

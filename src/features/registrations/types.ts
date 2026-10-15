export type RegistrationStatus = 'AwaitingPayment' | 'Confirmed' | 'Withdrawn' | 'Refunded' | 'Disqualified' | 'Expired'

export interface MyRegistration {
  seasonId: string
  status: RegistrationStatus
  clubName: string
  confirmedAt: string | null
  canWithdraw: boolean
}

export interface PaymentStatus {
  reference: string
  seasonId: string
  paymentStatus: 'Initialized' | 'Succeeded' | 'Failed' | 'Refunded'
  registrationStatus: RegistrationStatus
  amountKobo: number
}

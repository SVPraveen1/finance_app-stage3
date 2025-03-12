export interface Transaction {
  _id: string
  amount: number
  date: string
  description: string
  category: string
}

export interface Budget {
  _id: string
  category: string
  amount: number
}


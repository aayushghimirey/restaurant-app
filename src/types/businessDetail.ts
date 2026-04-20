export interface BusinessDetailRequest {
  companyName: string
  address: string
  panNumber: string
  businessNumber: string
  businessEmail: string
}

export interface BusinessDetailResponse {
  id: string
  companyName: string
  address: string
  panNumber: string
  businessNumber: string
  businessEmail: string
}

export interface BusinessDetailUpdate {
  companyName?: string
  address?: string
  panNumber?: string
  businessNumber?: string
  businessEmail?: string
}

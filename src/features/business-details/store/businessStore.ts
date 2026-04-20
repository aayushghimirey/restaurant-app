import { create } from "zustand"

interface BusinessStore {
  isBusinessDetailsMissing: boolean
  setBusinessDetailsMissing: (status: boolean) => void
}

export const useBusinessStore = create<BusinessStore>((set) => ({
  isBusinessDetailsMissing: false,
  setBusinessDetailsMissing: (status) => set({ isBusinessDetailsMissing: status }),
}))

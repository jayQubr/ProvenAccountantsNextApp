import { create } from 'zustand'

interface Store {
  user: any
  setUser: (user: any) => void
}

const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user: any) => set({ user }),
}))

export default useStore;
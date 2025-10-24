import { create } from 'zustand'

export type FavoritesState = {
  ids: string[]
  toggle: (id: string) => void
  isFavorite: (id: string) => boolean
  clear: () => void
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: [],
  toggle: (id: string) => {
    const cur = get().ids
    set({ ids: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] })
  },
  isFavorite: (id: string) => get().ids.includes(id),
  clear: () => set({ ids: [] }),
}))

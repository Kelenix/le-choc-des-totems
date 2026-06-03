import { create } from "zustand";

interface UserState {
  id: string | null;
  pseudo: string | null;
  points: number;
  streak: number;
  isAuthenticated: boolean;
  loginRequested: boolean;
  setUser: (id: string, pseudo: string) => void;
  updateStats: (points: number, streak: number) => void;
  requestLogin: () => void;
  cancelLogin: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  id: null,
  pseudo: null,
  points: 0,
  streak: 0,
  isAuthenticated: false,
  loginRequested: false,
  setUser: (id, pseudo) => set({ id, pseudo, isAuthenticated: true, loginRequested: false }),
  updateStats: (points, streak) => set({ points, streak }),
  requestLogin: () => set({ loginRequested: true }),
  cancelLogin: () => set({ loginRequested: false }),
  logout: () => set({ id: null, pseudo: null, points: 0, streak: 0, isAuthenticated: false }),
}));

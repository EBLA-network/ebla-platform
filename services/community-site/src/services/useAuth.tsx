import React, { useContext, createContext } from 'react';

// Auth is disabled for testnet wallet-only flow. The original Strapi
// auth backend is not deployed; wallet-connect via MetaMask is the
// only identity. This stub preserves the original interface so existing
// consumers compile, while no-op'ing every method.

type User = {
  id: number;
  username: string;
  email: string;
  eth_wallet: string;
  kyc: string;
  confirmed: boolean;
};

export type UpdateUserPayload = {
  username: string;
  password: string;
  eth_wallet: string;
};

type Context = {
  user: User | null;
  signin?: (username: string, password: string) => Promise<any>;
  signup?: (
    username: string,
    email: string,
    ethWallet: string,
    password: string,
    token: string,
  ) => Promise<any>;
  signout?: () => void;
  sendPasswordResetEmail?: (email: string, token: string) => Promise<any>;
  resetPassword?: (code: string, password: string, passwordConfirmation: string) => Promise<any>;
  emailConfirmation?: (email?: string) => Promise<any>;
  updateUser?: (payload: Partial<UpdateUserPayload>) => Promise<any>;
  refreshUser?: () => Promise<any>;
  setSessionExpired?: () => void;
  clearSessionExpired?: () => void;
  isSessionExpired?: boolean;
  isLoggedIn?: boolean;
};

const stubResult = { success: false, response: null };
const noop = () => {
  /* intentionally empty */
};
const noopAsync = async () => {
  /* intentionally empty */
};

const initialState: Context = {
  user: null,
  signin: async () => stubResult,
  signup: async () => stubResult,
  signout: noop,
  sendPasswordResetEmail: async () => stubResult,
  resetPassword: async () => stubResult,
  emailConfirmation: async () => stubResult,
  updateUser: async () => stubResult,
  refreshUser: noopAsync,
  setSessionExpired: noop,
  clearSessionExpired: noop,
  isSessionExpired: false,
  isLoggedIn: false,
};

const AuthContext = createContext<Context>(initialState);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthContext.Provider value={initialState}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

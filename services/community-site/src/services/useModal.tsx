import React, { useContext, createContext } from 'react';

// Modal system was used exclusively for auth (sign-in / sign-up /
// forgot-password / reset-password). With wallet-only identity, no
// modal is ever shown. Stub preserves the interface so existing
// consumers (Header, Sidebar, RunValidator) compile and no-op on call.

type Context = {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  content: string;
  setContent?: (content: string) => void;
  signIn?: () => void;
  reset?: () => void;
  code: string | undefined;
  setCode?: (code: string | undefined) => void;
  modal?: null | JSX.Element;
};

const initialState: Context = {
  isOpen: false,
  content: '',
  code: undefined,
  modal: null,
  setIsOpen: () => { /* noop */ },
  setContent: () => { /* noop */ },
  signIn: () => { /* noop */ },
  reset: () => { /* noop */ },
  setCode: () => { /* noop */ },
};

const ModalContext = createContext<Context>(initialState);

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  return <ModalContext.Provider value={initialState}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  return useContext(ModalContext);
};

import '../styles/app.scss';
import React from 'react';
import type { AppProps } from 'next/app';
import { EblaThemeProvider } from '@ebla-network/ebla-ui';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EblaThemeProvider>
      <Component {...pageProps} />
    </EblaThemeProvider>
  );
}

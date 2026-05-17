import React, { FC } from 'react';
import { StylesProvider, createGenerateClassName } from '@mui/styles';
import { EblaThemeProvider } from '@ebla-network/ebla-ui';

interface Props {
  children: React.ReactNode;
}

const generateClassName = createGenerateClassName({
  productionPrefix: 'explorer',
});

export const ExplorerThemeProvider: FC<Props> = ({ children }) => {
  return (
    <StylesProvider generateClassName={generateClassName}>
      <EblaThemeProvider>{children}</EblaThemeProvider>
    </StylesProvider>
  );
};

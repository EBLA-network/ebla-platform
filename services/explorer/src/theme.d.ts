import { theme as EblaTheme } from '@ebla-network/ebla-ui';

declare module '@mui/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends EblaTheme {
    // just so it isn't empty
    isEmpty?: false;
  }
}

import React from 'react';
import { DiscordIcon, SendIcon, TwitterIcon } from '../icons';

export type FooterItem = {
  label: string;
  Icon: JSX.Element;
};

export const useFooterEffects = (): { items: FooterItem[] } => {
  const items: FooterItem[] = [
    {
      label: 'Send',
      Icon: (
        <a href='https://t.me/EBLAnetwork' target='_blank' rel='noreferrer'>
          <SendIcon />
        </a>
      ),
    },
    {
      label: 'Discord',
      Icon: (
        <a
          href='https://discord.com/invite/gCkYC9h8S6'
          target='_blank'
          rel='noreferrer'
        >
          <DiscordIcon />
        </a>
      ),
    },
    {
      label: 'Twitter',
      Icon: (
        <a
          href='https://x.com/EBLAnetwork'
          target='_blank'
          rel='noreferrer'
        >
          <TwitterIcon />
        </a>
      ),
    },
  ];

  return { items };
};

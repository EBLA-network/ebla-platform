import React from 'react';
import { Footer as TFooter } from '@ebla-network/ebla-ui';
import { useFooterEffects } from './Footer.effects';

export const Footer = (): JSX.Element => {
  const { items } = useFooterEffects();

  return (
    <TFooter
      description="EBLA has the world's highest TPS/$, lowest node operating cost and lowest gas cost, on the world's only blockDAG & 100% EVM-compatible Layer-1 network."
      links={[
        { label: 'Privacy Policy', link: 'https://eblanetwork.com/privacy' },
      ]}
      items={items}
    />
  );
};

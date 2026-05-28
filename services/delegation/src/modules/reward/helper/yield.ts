// ESTIMATE ONLY. Flat 7% approximation of the EBLA initial yield.
// The authoritative yield is the on-chain decaying curve (EblaYieldTable[]:
// 7% initial, -5% of current per ~10M-block epoch, 1% floor). This off-chain
// calculator does NOT model decay and will drift from chain reality after
// epoch 0.
export const calculateYieldFor = (amount: number, seconds: number) => {
  const yearlyReward = (amount * 7) / 100;
  const perSeconds = yearlyReward / (365.2425 * 24 * 60 * 60);
  return seconds * perSeconds;
};

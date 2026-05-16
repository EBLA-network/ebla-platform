import { Label } from '@ebla-network/taraxa-ui';

export const AddressLabel = ({ label }: { label: string }) => {
  return <Label gap={true} icon={<></>} variant='loading' label={label} />;
};

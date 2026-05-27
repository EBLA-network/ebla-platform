import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => {
  return {
    button: {
      backgroundColor: '#151823 !important',
      borderRadius: '4px !important',
      color: '#40465F !important',
      border: '1px solid #54555a !important',
      margin: '0 10% 0 0 !important',
      width: '150px',
      height: '32px',
    },
    selected: {
      backgroundColor: '#33d9dc !important',
      borderRadius: '4px !important',
      color: '#151823 !important',
      margin: '0 8% 0 0 !important',
      width: '150px',
      height: '32px',
    },
  };
});

export default useStyles;

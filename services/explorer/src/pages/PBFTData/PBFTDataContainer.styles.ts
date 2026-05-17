import { makeStyles } from '@mui/styles';
import { theme } from '@ebla-network/ebla-ui';

const useStyles = makeStyles(
  () => {
    return {
      tabIconContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing(1),
      },
    };
  },
  { name: 'PBFTData' }
);

export default useStyles;

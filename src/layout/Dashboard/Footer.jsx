// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: '24px 16px 0px', mt: 'auto' }}>
      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <SvgIcon fontSize="small" sx={{ color: '#0088cc' }}>
          <path d="M21 3L3 10.5l4 1.5L8 20l3.5-2 3.5 2 6-16.5z" /> {/* simple plane shape; replace with full Telegram path if desired */}
        </SvgIcon>
        <Link href="https://t.me/libraryclub_bot" target="_blank" underline="hover">
         libraryclub{' '} ربات تلگرام
        </Link>
      </Typography>
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="https://codedthemes.com/about-us/" target="_blank" variant="caption" color="text.primary">
          درباره این وبسایت
        </Link>
        {/* <Link href="https://mui.com/legal/privacy/" target="_blank" variant="caption" color="text.primary">
          Privacy
        </Link>
        <Link href="https://mui.com/store/terms/" target="_blank" variant="caption" color="text.primary">
          Terms
        </Link> */}
      </Stack>
    </Stack>
  );
}

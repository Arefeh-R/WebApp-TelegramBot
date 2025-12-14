// material-ui
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// ==============================|| LOGO TEXT - STYLED (GRADIENT) ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  // Use theme colors for the gradient
  const primaryMain = theme.vars.palette.primary.main;
  const primaryDarker = theme.vars.palette.primary.darker;
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography
        variant="h3" // Use a large heading variant
        sx={{
          fontWeight: 700,
          letterSpacing: '0.05em',
          lineHeight: 1,
          
          // --- Gradient Styling ---
          // 1. Apply the gradient as a background image
          backgroundImage: `linear-gradient(45deg, ${primaryMain} 30%, ${primaryDarker} 90%)`,
          // 2. Hide the text color
          color: 'transparent',
          // 3. Clip the background image to the text shape
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          // ------------------------
        }}
      >
        libraryclub
      </Typography>
    </Box>
  );
}
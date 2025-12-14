// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'; // Ensure you have @mui/icons-material installed

// ==============================|| LOGO ICON (LIBRARY BOOK) ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
      <LocalLibraryIcon 
        // Use primary.dark for the main body
        sx={{ 
          fontSize: 32, 
          color: theme.vars.palette.primary.dark,
        }} 
      />
    </Box>
  );
}
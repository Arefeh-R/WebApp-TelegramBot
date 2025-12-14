// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useMemo } from 'react';

// project import
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import useAuth from 'hooks/useAuth';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const { user } = useAuth();
  
  // Filter menu items based on user type
  const filteredMenuItems = useMemo(() => {
    return menuItem.items.filter((item) => {
      // Show admin menu only to Site Admins (user_type === 'SA')
      if (item.id === 'admin' && user?.user_type !== 'SA') {
        return false;
      }
      return true;
    });
  }, [user]);

  const navGroups = filteredMenuItems.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}
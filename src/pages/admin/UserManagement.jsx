import MainCard from 'components/MainCard';
import { Typography } from '@mui/material';

const UserManagement = () => (
  <MainCard title="Admin User Management">
    <Typography variant="body2">
      This page is restricted to admin users only. It will contain the table and controls for managing all system users.
    </Typography>
  </MainCard>
);

export default UserManagement;
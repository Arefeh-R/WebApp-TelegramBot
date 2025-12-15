import { useNavigate } from 'react-router-dom';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import LockOutlined from '@ant-design/icons/LockOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

export default function SettingTab() {
  const navigate = useNavigate();

  const handleAccountSettings = () => {
    navigate('/settings/account');
  };

  const handleChangePassword = () => {
    navigate('/settings/password');
  };

  const handleHistory = () => {
    navigate('/history');
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton onClick={handleAccountSettings}>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="تنظیمات حساب" />
      </ListItemButton>
      <ListItemButton onClick={handleChangePassword}>
        <ListItemIcon>
          <LockOutlined />
        </ListItemIcon>
        <ListItemText primary="تغییر رمز عبور" />
      </ListItemButton>
      <ListItemButton onClick={handleHistory}>
        <ListItemIcon>
          <HistoryOutlined />
        </ListItemIcon>
        <ListItemText primary="تاریخچه" />
      </ListItemButton>
    </List>
  );
}
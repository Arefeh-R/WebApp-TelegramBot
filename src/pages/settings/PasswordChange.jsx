import { useState } from 'react';
import MainCard from 'components/MainCard';
import { 
  TextField, 
  Button, 
  Stack, 
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axios from 'utils/axios';

const PasswordChange = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('/users/set_password/', formData);
      setMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر کرد' });
      setFormData({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
      });
    } catch (error) {
      const errorMsg = error.response?.data?.old_password?.[0] 
        || error.response?.data?.new_password?.[0]
        || error.response?.data?.new_password_confirm?.[0]
        || error.response?.data?.detail 
        || 'خطا در تغییر رمز عبور';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="تغییر رمز عبور">
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {message.text && (
            <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </Alert>
          )}

          <TextField
            fullWidth
            required
            type={showPasswords.old ? 'text' : 'password'}
            label="رمز عبور فعلی"
            name="old_password"
            value={formData.old_password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                  >
                    {showPasswords.old ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            required
            type={showPasswords.new ? 'text' : 'password'}
            label="رمز عبور جدید"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  >
                    {showPasswords.new ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            required
            type={showPasswords.confirm ? 'text' : 'password'}
            label="تکرار رمز عبور جدید"
            name="new_password_confirm"
            value={formData.new_password_confirm}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  >
                    {showPasswords.confirm ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
          </Button>
        </Stack>
      </form>
    </MainCard>
  );
};

export default PasswordChange;

import { useState } from 'react';
import MainCard from 'components/MainCard';
import { 
  TextField, 
  Button, 
  Stack, 
  Alert,
  CircularProgress 
} from '@mui/material';
import useAuth from 'hooks/useAuth';
import axios from 'utils/axios';

const ProfileEdit = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    display_name: user?.display_name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || ''
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
      await axios.patch('/users/me/', formData);
      setMessage({ type: 'success', text: 'پروفایل با موفقیت به‌روزرسانی شد' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'خطا در به‌روزرسانی پروفایل' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="ویرایش پروفایل">
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {message.text && (
            <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </Alert>
          )}

          <TextField
            fullWidth
            label="نام"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="نام خانوادگی"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="نام نمایشی"
            name="display_name"
            value={formData.display_name}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="درباره من"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="آدرس تصویر پروفایل"
            name="avatar_url"
            value={formData.avatar_url}
            onChange={handleChange}
            placeholder="https://example.com/avatar.jpg"
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </Stack>
      </form>
    </MainCard>
  );
};

export default ProfileEdit;

import MainCard from 'components/MainCard';
import { Typography, Stack, Avatar, Divider, Grid } from '@mui/material';
import useAuth from 'hooks/useAuth';

const ProfileView = () => {
  const { user } = useAuth();

  return (
    <MainCard title="پروفایل من">
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            src={user?.avatar_url} 
            sx={{ width: 80, height: 80 }}
          >
            {user?.display_name?.charAt(0)}
          </Avatar>
          <Stack>
            <Typography variant="h4">{user?.display_name || user?.username}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
          </Stack>
        </Stack>

        <Divider />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">نام</Typography>
            <Typography variant="body1">{user?.first_name || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">نام خانوادگی</Typography>
            <Typography variant="body1">{user?.last_name || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">درباره من</Typography>
            <Typography variant="body1">{user?.bio || 'هنوز بیوگرافی ننوشته‌اید'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">تعداد دنبال‌کنندگان</Typography>
            <Typography variant="h5">{user?.followers_count || 0}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">کتاب‌های امتیازدهی شده</Typography>
            <Typography variant="h5">{user?.books_rated_count || 0}</Typography>
          </Grid>
        </Grid>
      </Stack>
    </MainCard>
  );
};

export default ProfileView;


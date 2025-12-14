import { Grid, Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { 
  TeamOutlined, 
  AppstoreOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { useTelegramGroups, useGroupCategories } from 'hooks/useTelegramGroups';
import { usePendingGroups } from 'hooks/useAdmin';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}.lighter`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: `${color}.main`
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h3" component="div">
          {value}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { groups: allGroups, isLoading: loadingGroups } = useTelegramGroups();
  const { groups: pendingGroups, isLoading: loadingPending } = usePendingGroups();
  const { categories, isLoading: loadingCategories } = useGroupCategories();

  const approvedGroups = allGroups.filter(g => g.is_approved);
  const totalMembers = allGroups.reduce((sum, g) => sum + (g.member_count || 0), 0);

  const stats = [
    {
      title: 'کل گروه‌ها',
      value: loadingGroups ? '...' : allGroups.length,
      icon: <TeamOutlined />,
      color: 'primary'
    },
    {
      title: 'گروه‌های تأیید شده',
      value: loadingGroups ? '...' : approvedGroups.length,
      icon: <CheckCircleOutlined />,
      color: 'success'
    },
    {
      title: 'در انتظار تأیید',
      value: loadingPending ? '...' : pendingGroups.length,
      icon: <ClockCircleOutlined />,
      color: 'warning'
    },
    {
      title: 'دسته‌بندی‌ها',
      value: loadingCategories ? '...' : categories.length,
      icon: <AppstoreOutlined />,
      color: 'info'
    }
  ];

  return (
    <MainCard title="داشبورد مدیریت">
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}

        {/* Additional Info Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                آمار سریع
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body1">
                  کل اعضا: <strong>{totalMembers}</strong>
                </Typography>
                <Typography variant="body1">
                  میانگین اعضا در هر گروه: <strong>
                    {allGroups.length > 0 ? Math.round(totalMembers / allGroups.length) : 0}
                  </strong>
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Pending Groups */}
        {pendingGroups.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  درخواست‌های اخیر در انتظار تأیید
                </Typography>
                <Stack spacing={1}>
                  {pendingGroups.slice(0, 5).map((group) => (
                    <Box
                      key={group.id}
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.default',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="subtitle1">{group.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description || 'بدون توضیحات'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </MainCard>
  );
};

export default AdminDashboard;
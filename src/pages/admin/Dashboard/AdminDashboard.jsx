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
      title: 'Total Groups',
      value: loadingGroups ? '...' : allGroups.length,
      icon: <TeamOutlined />,
      color: 'primary'
    },
    {
      title: 'Approved Groups',
      value: loadingGroups ? '...' : approvedGroups.length,
      icon: <CheckCircleOutlined />,
      color: 'success'
    },
    {
      title: 'Pending Approval',
      value: loadingPending ? '...' : pendingGroups.length,
      icon: <ClockCircleOutlined />,
      color: 'warning'
    },
    {
      title: 'Categories',
      value: loadingCategories ? '...' : categories.length,
      icon: <AppstoreOutlined />,
      color: 'info'
    }
  ];

  return (
    <MainCard title="Admin Dashboard">
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
                Quick Stats
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body1">
                  Total Members: <strong>{totalMembers}</strong>
                </Typography>
                <Typography variant="body1">
                  Average Members per Group: <strong>
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
                  Recent Pending Requests
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
                        {group.description || 'No description'}
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
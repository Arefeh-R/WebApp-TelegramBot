// material-ui
import { Stack, Typography, Divider, CircularProgress } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import { useLibraryStats } from 'hooks/useLibraryStats';
import useAuth from 'hooks/useAuth';

// icons
import {
  BookOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

export default function NavCard() {
  const { isLoggedIn } = useAuth();
  const { stats, loading } = useLibraryStats();
  
  // Don't render if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <MainCard sx={{ bgcolor: 'grey.50', m: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5">
          کتاب های شما
        </Typography>

        <Typography variant="body2" color="text.secondary">
          نمای کلی از وضعیت شما در کتابخانه
        </Typography>

        <Divider />

        {loading ? (
          <Stack alignItems="center" py={2}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <StatRow icon={<BookOutlined />} label="کل کتاب ها " value={stats.total} />
            <StatRow icon={<HeartOutlined />} label="می خواهم بخوانم" value={stats.want} />
            <StatRow icon={<ClockCircleOutlined />} label="در حال مطالعه" value={stats.reading} />
            <StatRow icon={<CheckCircleOutlined />} label="تمام شده" value={stats.read} />
          </Stack>
        )}
      </Stack>
    </MainCard>
  );
}

// small helper component
function StatRow({ icon, label, value }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography variant="body2">{label}</Typography>
      </Stack>
      <Typography variant="subtitle2">{value}</Typography>
    </Stack>
  );
}
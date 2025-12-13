// material-ui
import { Stack, Typography, Divider, CircularProgress } from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import { useLibraryStats } from 'hooks/useLibraryStats';

// icons
import {
  BookOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

export default function NavCard() {
  const { stats, loading } = useLibraryStats();

  return (
    <MainCard sx={{ bgcolor: 'grey.50', m: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h5">
          My Library
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Your reading progress
        </Typography>

        <Divider />

        {loading ? (
          <Stack alignItems="center" py={2}>
            <CircularProgress size={24} />
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <StatRow icon={<BookOutlined />} label="Total" value={stats.total} />
            <StatRow icon={<HeartOutlined />} label="Want to Read" value={stats.want} />
            <StatRow icon={<ClockCircleOutlined />} label="Reading" value={stats.reading} />
            <StatRow icon={<CheckCircleOutlined />} label="Completed" value={stats.read} />
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

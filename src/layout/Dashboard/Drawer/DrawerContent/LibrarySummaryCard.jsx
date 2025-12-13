// material-ui
import { Stack, Typography, Box, Divider, Skeleton } from '@mui/material';
import { 
  BookOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

// project import
import MainCard from 'components/MainCard';
import { useGetUserLibrary } from 'hooks/useBooks';
import { useAuth } from 'contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ==============================|| LIBRARY STAT ITEM ||============================== //

function LibraryStatItem({ icon, label, count, color, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 1.5,
        borderRadius: 1,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: `${color}.lighter`,
          transform: 'translateX(4px)'
        }
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.lighter`,
            color: `${color}.main`
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="h4" color={`${color}.main`} fontWeight={600}>
        {count}
      </Typography>
    </Box>
  );
}

// ==============================|| DRAWER CONTENT - LIBRARY SUMMARY CARD ||============================== //

export default function LibrarySummaryCard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { library = [], libraryLoading } = useGetUserLibrary({});

  // If not authenticated, don't show the card
  if (!isAuthenticated) {
    return null;
  }

  // Calculate counts for each status (using backend status values)
  const wantToReadCount = library?.filter(item => item.status === 'wishlist').length || 0;
  const currentlyReadingCount = library?.filter(item => item.status === 'reading').length || 0;
  const readCount = library?.filter(item => item.status === 'Completed').length || 0;
  const totalCount = library?.length || 0;

  const handleNavigation = (status) => {
    if (status) {
      navigate(`/library?status=${status}`);
    } else {
      navigate('/library');
    }
  };

  return (
    <MainCard 
      sx={{ 
        bgcolor: 'grey.50', 
        m: 3,
        boxShadow: (theme) => theme.customShadows.z1
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
          sx={{ cursor: 'pointer' }}
          onClick={() => handleNavigation()}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <BookOutlined style={{ fontSize: '1.25rem', color: '#1890ff' }} />
            <Typography variant="h5">My Library</Typography>
          </Stack>
          <Typography variant="h3" color="primary" fontWeight={700}>
            {libraryLoading ? <Skeleton width={30} /> : totalCount}
          </Typography>
        </Stack>

        <Divider />

        {/* Stats */}
        {libraryLoading ? (
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Stack>
        ) : (
          <Stack spacing={0.5}>
            <LibraryStatItem
              icon={<HeartOutlined />}
              label="Want to Read"
              count={wantToReadCount}
              color="warning"
              onClick={() => handleNavigation('wishlist')}
            />
            <LibraryStatItem
              icon={<ClockCircleOutlined />}
              label="Reading"
              count={currentlyReadingCount}
              color="info"
              onClick={() => handleNavigation('reading')}
            />
            <LibraryStatItem
              icon={<CheckCircleOutlined />}
              label="Completed"
              count={readCount}
              color="success"
              onClick={() => handleNavigation('Completed')}
            />
          </Stack>
        )}
      </Stack>
    </MainCard>
  );
}
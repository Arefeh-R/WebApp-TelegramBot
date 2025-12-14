import { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Stack,
  Chip,
  Button
} from '@mui/material';
import { DeleteOutlined, EyeOutlined, BookOutlined, ClockCircleOutlined, CheckCircleOutlined, HeartOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import { useGetUserLibrary, updateReadingStatus, removeFromLibrary } from 'hooks/useBooks';
import BookCard from 'components/books/BookCard';
import { useNavigate, useSearchParams } from 'react-router-dom';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function MyLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  // Backend status values: 'wishlist', 'reading', 'Completed'
  const statuses = ['all', 'wishlist', 'reading', 'Completed'];
  const statusLabels = {
    wishlist: 'می خواهم بخوانم',
    reading: 'در حال مطالعه',
    completed: 'تمام شده'
  };

  // Initialize tab from URL parameter
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      const index = statuses.indexOf(statusParam);
      if (index !== -1) {
        setTab(index);
      }
    }
  }, [searchParams]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    // Update URL when tab changes
    if (newValue === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ status: statuses[newValue] });
    }
  };

  const currentStatus = statuses[tab];
  const params = currentStatus === 'all' ? {} : { status: currentStatus };
  const { library = [], libraryLoading, libraryEmpty } = useGetUserLibrary(params);

  const handleChangeStatus = async (itemId, newStatus, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const result = await updateReadingStatus(itemId, newStatus);
    if (!result.success) {
      alert('Failed to update status: ' + result.error);
    }
  };

  const handleRemove = async (itemId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (window.confirm('Remove this book from your library?')) {
      const result = await removeFromLibrary(itemId);
      if (!result.success) {
        alert('Failed to remove book: ' + result.error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'reading':
        return 'info';
      case 'wishlist':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Calculate stats from all library items
  const { library: allLibrary = [] } = useGetUserLibrary({});
  const stats = {
    all: allLibrary.length,
    wishlist: allLibrary.filter(item => item.status === 'wishlist').length,
    reading: allLibrary.filter(item => item.status === 'reading').length,
    completed: allLibrary.filter(item => item.status === 'Completed').length
  };

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* Page Header */}
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5">کتابخانه من</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              مدیریت کتاب های خود و پیگیری پیشرفت مطالعه شما
            </Typography>
          </Box>
          <Chip
            label={`${stats.all} ${stats.all === 1 ? 'Book' : 'Books'}`}
            color="primary"
            variant="outlined"
            size="medium"
          />
        </Stack>
      </Grid>

      {/* Stats Cards */}
      <Grid item xs={6} sm={6} md={3}>
        <MainCard>
          <Stack spacing={0.5}>
            <Typography variant="h6" color="text.secondary">
              همه کتاب های من
            </Typography>
            <Typography variant="h3" color="primary">
              {stats.all}
            </Typography>
          </Stack>
        </MainCard>
      </Grid>

      <Grid item xs={6} sm={6} md={3}>
        <MainCard>
          <Stack spacing={0.5}>
            <Typography variant="h6" color="text.secondary">
              می خواهم بخوانم
            </Typography>
            <Typography variant="h3" color="warning.main">
              {stats.wishlist}
            </Typography>
          </Stack>
        </MainCard>
      </Grid>

      <Grid item xs={6} sm={6} md={3}>
        <MainCard>
          <Stack spacing={0.5}>
            <Typography variant="h6" color="text.secondary">
              در حال مطالعه
            </Typography>
            <Typography variant="h3" color="info.main">
              {stats.reading}
            </Typography>
          </Stack>
        </MainCard>
      </Grid>

      <Grid item xs={6} sm={6} md={3}>
        <MainCard>
          <Stack spacing={0.5}>
            <Typography variant="h6" color="text.secondary">
              تمام شده
            </Typography>
            <Typography variant="h3" color="success.main">
              {stats.completed}
            </Typography>
          </Stack>
        </MainCard>
      </Grid>

      {/* Tabs Card */}
      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 3,
                pt: 2,
                '& .MuiTabs-indicator': {
                  height: 3
                }
              }}
            >
              <Tab icon={<BookOutlined />} iconPosition="start" label="کل کتاب ها" />
              <Tab icon={<HeartOutlined />} iconPosition="start" label="می خواهم بخوانم" />
              <Tab icon={<ClockCircleOutlined />} iconPosition="start" label="در حال مطالعه" />
              <Tab icon={<CheckCircleOutlined />} iconPosition="start" label="تمام شده" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 2.5 }}>
            <TabPanel value={tab} index={tab}>
              {libraryLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : libraryEmpty ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <BookOutlined style={{ fontSize: 80, color: '#bbb', marginBottom: 16 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    کتابخانه شما خالی است
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    به مشاهده کتاب ها بروید و کتاب های مورد علاقه خود را اضافه کنید.
                  </Typography>
                  <Button variant="contained" onClick={() => navigate('/dashboard/books')}>
                    مشاهده کتاب ها
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {library.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={item.id}>
                      <MainCard
                        boxShadow
                        shadow={(theme) => theme.customShadows.z1}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: (theme) => theme.customShadows.z8
                          }
                        }}
                      >
                        {/* Book Card */}
                        <Box sx={{ flexGrow: 1, mb: 2 }}>
                          <BookCard book={item.book} />
                        </Box>

                        {/* Status Badge */}
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={statusLabels[item.status] || item.status}
                            color={getStatusColor(item.status)}
                            size="small"
                            sx={{
                              width: '100%',
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>

                        {/* Action Controls */}
                        <Stack spacing={1.5}>
                          <FormControl fullWidth size="small">
                            <Select
                              value={item.status || 'wishlist'}
                              onChange={(e) => handleChangeStatus(item.id, e.target.value, e)}
                              onClick={(e) => e.stopPropagation()}
                              displayEmpty
                              sx={{
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'divider'
                                }
                              }}
                            >
                              <MenuItem value="wishlist">می خواهم بخوانم</MenuItem>
                              <MenuItem value="reading">در حال خواندن</MenuItem>
                              <MenuItem value="completed">تمام شده</MenuItem>
                            </Select>
                          </FormControl>

                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              fullWidth
                              startIcon={<EyeOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/dashboard/books/${item.book.parent_asin || item.book.id}`);
                              }}
                            >
                              مشاهده کتاب
                            </Button>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={(e) => handleRemove(item.id, e)}
                              sx={{
                                border: 1,
                                borderColor: 'error.main',
                                borderRadius: 1,
                                '&:hover': {
                                  backgroundColor: 'error.lighter',
                                  borderColor: 'error.dark'
                                }
                              }}
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </MainCard>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default MyLibrary;
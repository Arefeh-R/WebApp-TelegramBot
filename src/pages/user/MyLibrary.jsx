// src/pages/books/MyLibrary.jsx
import { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Grid, 
  Typography, 
  CircularProgress,
  Stack,
  Chip
} from '@mui/material';
import { updateReadingStatus, removeFromLibrary, useGetUserLibrary} from 'hooks/useBooks';
import BookCard from 'components/books/BookCard';

// project import
import MainCard from 'components/MainCard';

// assets
import { BookOutlined, ClockCircleOutlined, CheckCircleOutlined, HeartOutlined } from '@ant-design/icons';

function MyLibrary() {
  const [tab, setTab] = useState(0);
  
  const statuses = ['all', 'wishlist', 'reading', 'Completed'];
  const currentStatus = statuses[tab];
  
  const params = currentStatus === 'all' ? {} : { status: currentStatus };
  const { library, libraryLoading, libraryEmpty } = useGetUserLibrary(params);

  const handleChangeStatus = async (itemId, newStatus) => {
    const result = await updateReadingStatus(itemId, newStatus);
    if (!result.success) {
      alert('Failed to update status: ' + result.error);
    }
  };

  const handleRemove = async (itemId) => {
    if (window.confirm('Remove this book from your library?')) {
      const result = await removeFromLibrary(itemId);
      if (!result.success) {
        alert('Failed to remove book: ' + result.error);
      }
    }
  };

  // Get stats for each category
  const getStats = () => {
    if (!library || library.length === 0) return { all: 0, want: 0, reading: 0, read: 0 };
    
    return {
      all: library.length,
      want: library.filter(item => item.status === 'wishlist').length,
      reading: library.filter(item => item.status === 'reading').length,
      read: library.filter(item => item.status === 'Completed').length
    };
  };

  const stats = getStats();

  return (
    <Box>
      {/* Page Header */}
      <MainCard>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h3" sx={{ mb: 1 }}>
              My Library
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your reading collection
            </Typography>
          </Box>
          <Chip 
            label={`${library?.length || 0} Books`} 
            color="primary" 
            variant="outlined"
            size="medium"
          />
        </Stack>
      </MainCard>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={6} sm={6} md={3}>
          <MainCard contentSX={{ p: 2.25 }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" color="text.secondary">
                Total Books
              </Typography>
              <Grid container alignItems="center">
                <Grid item>
                  <Typography variant="h4" color="inherit">
                    {stats.all}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <MainCard contentSX={{ p: 2.25 }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" color="text.secondary">
                Want to Read
              </Typography>
              <Grid container alignItems="center">
                <Grid item>
                  <Typography variant="h4" color="warning.main">
                    {stats.want}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <MainCard contentSX={{ p: 2.25 }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" color="text.secondary">
                Currently Reading
              </Typography>
              <Grid container alignItems="center">
                <Grid item>
                  <Typography variant="h4" color="info.main">
                    {stats.reading}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={6} sm={6} md={3}>
          <MainCard contentSX={{ p: 2.25 }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" color="text.secondary">
                Completed
              </Typography>
              <Grid container alignItems="center">
                <Grid item>
                  <Typography variant="h4" color="success.main">
                    {stats.read}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      {/* Tabs and Content */}
      <MainCard sx={{ mt: 3 }}>
        <Tabs 
          value={tab} 
          onChange={(e, v) => setTab(v)} 
          sx={{ 
            mb: 3,
            '& .MuiTabs-flexContainer': {
              borderBottom: 1,
              borderColor: 'divider'
            }
          }}
        >
          <Tab 
            icon={<BookOutlined />} 
            iconPosition="start" 
            label="All Books" 
          />
          <Tab 
            icon={<HeartOutlined />} 
            iconPosition="start" 
            label="Want to Read" 
          />
          <Tab 
            icon={<ClockCircleOutlined />} 
            iconPosition="start" 
            label="Reading" 
          />
          <Tab 
            icon={<CheckCircleOutlined />} 
            iconPosition="start" 
            label="Completed" 
          />
        </Tabs>

        {libraryLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : libraryEmpty ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BookOutlined style={{ fontSize: 64, color: '#bbb', marginBottom: 16 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No books in this category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start adding books to build your library
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {library.map((item) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={item.id}>
                <BookCard 
                  book={item.book}
                  libraryItem={item}
                  onChangeStatus={handleChangeStatus}
                  onRemove={handleRemove}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </MainCard>
    </Box>
  );
}

export default MyLibrary;
// src/pages/MyLibrary.jsx
import { useState } from 'react';
import { Box, Tabs, Tab, Grid, Typography, CircularProgress } from '@mui/material';
import { useGetUserLibrary } from 'hooks/useBooks';
import { updateReadingStatus, removeFromLibrary } from 'hooks/useBooks';
import BookCard from 'components/books/BookCard';

function MyLibrary() {
  const [tab, setTab] = useState(0);
  
  const statuses = ['all', 'want_to_read', 'currently_reading', 'read'];
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
    if (confirm('Remove this book from your library?')) {
      const result = await removeFromLibrary(itemId);
      if (!result.success) {
        alert('Failed to remove book: ' + result.error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Library
      </Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="All" />
        <Tab label="Want to Read" />
        <Tab label="Currently Reading" />
        <Tab label="Read" />
      </Tabs>

      {libraryLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : libraryEmpty ? (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          No books in this category
        </Typography>
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
    </Box>
  );
}

export default MyLibrary;
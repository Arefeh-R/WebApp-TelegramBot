import { useState } from 'react';
import { Box, CircularProgress, Typography, Alert, Stack, Grid } from '@mui/material';
import { useGetBooks } from 'hooks/useBooks';
import BookList from 'components/books/BookList';

// project import
import MainCard from 'components/MainCard';

// assets
import { BookOutlined } from '@ant-design/icons';

function BooksList() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 24;

  const { books, totalBooks, booksLoading, booksError, booksEmpty } = useGetBooks({
    page,
    limit: itemsPerPage
  });

  const totalPages = Math.ceil(totalBooks / itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (booksLoading) {
    return (
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12}>
          <MainCard>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress size={60} />
                <Typography variant="body1" color="text.secondary">
                 در حال بارگذاری کتاب ها...
                </Typography>
              </Stack>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  if (booksError) {
    return (
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12}>
          <MainCard>
            <Alert severity="error">
              <Typography variant="h6">خطا در بارگذاری کتاب ها</Typography>
              <Typography variant="body2">{booksError}</Typography>
            </Alert>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  if (booksEmpty) {
    return (
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12}>
          <MainCard>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BookOutlined style={{ fontSize: 80, color: '#bbb', marginBottom: 16 }} />
              <Typography variant="h4" color="text.secondary" gutterBottom>
                کتابی یافت نشد
              </Typography>
              <Typography variant="body2" color="text.secondary">
                هنوز هیچ کتابی در کتابخانه وجود ندارد. لطفاً بعداً دوباره بررسی کنید.
              </Typography>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12}>
        <BookList
          books={books}
          title=""
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Grid>
    </Grid>
  );
}

export default BooksList;
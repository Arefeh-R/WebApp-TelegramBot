// src/pages/BooksList.jsx
import { useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useGetBooks } from 'hooks/useBooks';
import BookList from 'components/books/BookList';

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
  };

  if (booksLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (booksError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading books: {booksError}
      </Alert>
    );
  }

  if (booksEmpty) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
        No books found
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <BookList
        books={books}
        title="Browse Books"
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Box>
  );
}

export default BooksList;
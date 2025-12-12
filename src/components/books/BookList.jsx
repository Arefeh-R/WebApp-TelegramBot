// src/components/books/BookList.jsx
import { Grid, Typography, Box, Pagination } from '@mui/material';
import BookCard from './BookCard';

const BookList = ({ books, title, page, totalPages, onPageChange }) => {
  return (
    <Box>
      {title && (
        <Typography variant="h4" sx={{ mb: 3 }}>
          {title}
        </Typography>
      )}
      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item xs={6} sm={4} md={3} lg={2.4} key={book.id}>
            <BookCard book={book} />
          </Grid>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={onPageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default BookList;
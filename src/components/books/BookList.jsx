import PropTypes from 'prop-types';
import { Grid, Typography, Box, Pagination, Stack } from '@mui/material';
import BookCard from './BookCard';

// project import
import MainCard from 'components/MainCard';

const BookList = ({ books, title, page, totalPages, onPageChange }) => {
  return (
    <MainCard>
      {title && (
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h3">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {books.length} books found
          </Typography>
        </Stack>
      )}
      
      <Grid container spacing={3}>
        {books.map((book) => (
          // use integer columns (no fractions). adjust lg to suit how many cards per row you want:
          // lg={2} -> 6 cards per row (12/2), lg={3} -> 4 per row (12/3), lg={4} -> 3 per row, etc.
          <Grid item xs={6} sm={4} md={3} lg={2} key={book.parent_asin || book.id}>
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
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </MainCard>
  );
};

BookList.propTypes = {
  books: PropTypes.array.isRequired,
  title: PropTypes.string,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func
};

export default BookList;
// src/pages/BookDetail.jsx
import { useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Alert, Grid, Typography, Rating } from '@mui/material';
import { useGetBook } from 'hooks/useBooks';
import { useGetReviews } from 'hooks/useReviews';
import { addBookToLibrary } from 'hooks/useBooks';
import { addReview } from 'hooks/useReviews';
import ReviewList from 'components/reviews/ReviewList';

function BookDetail() {
  const { id } = useParams();
  const { book, bookLoading, bookError } = useGetBook(id);
  const { reviews, reviewsLoading } = useGetReviews(id);

  const handleAddToLibrary = async (status) => {
    const result = await addBookToLibrary(id, status);
    if (result.success) {
      alert('Book added to your library!');
    } else {
      alert('Failed to add book: ' + result.error);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    const result = await addReview(id, reviewData);
    if (result.success) {
      alert('Review submitted!');
    } else {
      alert('Failed to submit review: ' + result.error);
    }
  };

  if (bookLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (bookError || !book) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading book details
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box
            component="img"
            src={book.cover_image || '/placeholder-book.jpg'}
            alt={book.title}
            sx={{ width: '100%', borderRadius: 2 }}
          />
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Typography variant="h3" gutterBottom>
            {book.title}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" gutterBottom>
            by {book.author}
          </Typography>
          
          <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
            <Rating value={book.average_rating || 0} precision={0.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {book.average_rating?.toFixed(1)} ({book.reviews_count} reviews)
            </Typography>
          </Box>

          <Typography variant="body1" paragraph>
            {book.description}
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => handleAddToLibrary('want_to_read')}
            >
              Want to Read
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleAddToLibrary('currently_reading')}
            >
              Currently Reading
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Reviews
        </Typography>
        {reviewsLoading ? (
          <CircularProgress />
        ) : (
          <ReviewList reviews={reviews} onSubmit={handleSubmitReview} />
        )}
      </Box>
    </Box>
  );
}

export default BookDetail;
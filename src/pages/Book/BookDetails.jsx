import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Alert, 
  Grid, 
  Typography, 
  Rating, 
  Stack,
  Chip,
  Divider,
  ButtonGroup
} from '@mui/material';
import { useGetBook } from 'hooks/useBooks';
import { useGetReviews, addReview} from 'hooks/useReviews';
import { addBookToLibrary } from 'hooks/useBooks';
import ReviewList from 'components/reviews/ReviewList';

// project import
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import { 
  HeartOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  BookOutlined 
} from '@ant-design/icons';

function BookDetail() {
  const { id } = useParams();
  const { book, bookLoading, bookError } = useGetBook(id);
  const { reviews, reviewsLoading } = useGetReviews(id);
  const [addingToLibrary, setAddingToLibrary] = useState(false);

  const handleAddToLibrary = async (status) => {
    setAddingToLibrary(true);
    const result = await addBookToLibrary(id, status);
    setAddingToLibrary(false);
    
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
      <MainCard>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} />
            <Typography variant="body1" color="text.secondary">
              Loading book details...
            </Typography>
          </Stack>
        </Box>
      </MainCard>
    );
  }

  if (bookError || !book) {
    return (
      <MainCard>
        <Alert severity="error">
          <Typography variant="h6">Error loading book details</Typography>
          <Typography variant="body2">The book could not be found or loaded.</Typography>
        </Alert>
      </MainCard>
    );
  }

  const cover = book.cover_image || book.image_url || (book.images && book.images[0]?.large_url) || 'https://via.placeholder.com/300x450?text=No+Cover';
  const authorText =
    book.author ||
    (book.authors && Array.isArray(book.authors) ? book.authors.map((a) => a.name || a).join(', ') : book.authors) ||
    'Unknown Author';
  const avgRating = Number(book.average_rating ?? book.avg_rating ?? 0) || 0;
  const reviewsCount = book.reviews_count ?? book.rating_number ?? 0;

  return (
    <Box>
      {/* Main Book Details */}
      <MainCard>
        <Grid container spacing={4}>
          {/* Book Cover */}
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              src={cover}
              alt={book.title}
              sx={{ 
                width: '100%', 
                maxWidth: 400,
                borderRadius: 2,
                boxShadow: 3,
                objectFit: 'cover'
              }}
            />
          </Grid>
          
          {/* Book Info */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h2" gutterBottom>
                  {book.title}
                </Typography>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  by {authorText}
                </Typography>
              </Box>

              {/* Rating */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <Rating value={avgRating} precision={0.5} readOnly size="large" />
                <Typography variant="h6" color="text.secondary">
                  {avgRating.toFixed(1)}
                </Typography>
                <Chip 
                  label={`${reviewsCount} reviews`} 
                  size="small" 
                  variant="outlined"
                />
              </Stack>

              <Divider />

              {/* Description */}
              {book.description && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    About this book
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {book.description}
                  </Typography>
                </Box>
              )}

              {/* Additional Info */}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {book.published_year && (
                  <Chip 
                    icon={<BookOutlined />}
                    label={`Published: ${book.published_year}`} 
                    variant="outlined"
                  />
                )}
                {book.pages && (
                  <Chip 
                    label={`${book.pages} pages`} 
                    variant="outlined"
                  />
                )}
                {book.isbn && (
                  <Chip 
                    label={`ISBN: ${book.isbn}`} 
                    variant="outlined"
                  />
                )}
              </Stack>

              <Divider />

              {/* Add to Library Buttons */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Add to your library
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <AnimateButton>
                    <Button 
                      variant="contained" 
                      color="warning"
                      size="large"
                      startIcon={<HeartOutlined />}
                      onClick={() => handleAddToLibrary('want_to_read')}
                      disabled={addingToLibrary}
                    >
                      Want to Read
                    </Button>
                  </AnimateButton>
                  
                  <AnimateButton>
                    <Button 
                      variant="contained" 
                      color="info"
                      size="large"
                      startIcon={<ClockCircleOutlined />}
                      onClick={() => handleAddToLibrary('currently_reading')}
                      disabled={addingToLibrary}
                    >
                      Currently Reading
                    </Button>
                  </AnimateButton>
                  
                  <AnimateButton>
                    <Button 
                      variant="contained" 
                      color="success"
                      size="large"
                      startIcon={<CheckCircleOutlined />}
                      onClick={() => handleAddToLibrary('read')}
                      disabled={addingToLibrary}
                    >
                      Mark as Read
                    </Button>
                  </AnimateButton>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>

      {/* Reviews Section */}
      <MainCard sx={{ mt: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Reader Reviews
            </Typography>
            <Typography variant="body2" color="text.secondary">
              See what others are saying about this book
            </Typography>
          </Box>
          
          <Divider />
          
          {reviewsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ReviewList reviews={reviews} onSubmit={handleSubmitReview} />
          )}
        </Stack>
      </MainCard>
    </Box>
  );
}

export default BookDetail;
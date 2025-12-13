import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  CardMedia
} from '@mui/material';
import {
  HeartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import ReviewList from 'components/reviews/ReviewList';
import { useGetBook } from 'hooks/useBooks';
import { useGetReviews, addReview, updateReview, deleteReview } from 'hooks/useReviews';
import { addBookToLibrary } from 'hooks/useBooks';

// ==============================|| BOOK DETAIL PAGE ||============================== //

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book, bookLoading, bookError } = useGetBook(id);
  const { reviews, reviewsLoading } = useGetReviews(id);
  const [addingToLibrary, setAddingToLibrary] = useState(false);

  const handleAddToLibrary = async (status) => {
    setAddingToLibrary(true);
    const bookId = book.parent_asin || id;
    const result = await addBookToLibrary(bookId, status);
    setAddingToLibrary(false);

    if (result.success) {
      alert('Book added to your library!');
    } else {
      alert('Failed to add book: ' + result.error);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    const bookId = book.parent_asin || id;
    const result = await addReview(bookId, reviewData);
    if (result.success) {
      alert('Review submitted successfully!');
    } else {
      alert('Failed to submit review: ' + result.error);
    }
  };

  const handleUpdateReview = async (reviewId, reviewData) => {
    const bookId = book.parent_asin || id;
    const result = await updateReview(bookId, reviewId, reviewData);
    if (result.success) {
      alert('Review updated successfully!');
    } else {
      alert('Failed to update review: ' + result.error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const bookId = book.parent_asin || id;
    const result = await deleteReview(bookId, reviewId);
    if (result.success) {
      alert('Review deleted successfully!');
    } else {
      alert('Failed to delete review: ' + result.error);
    }
  };

  if (bookLoading) {
    return (
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    );
  }

  if (bookError || !book) {
    return (
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12}>
          <MainCard>
            <Alert severity="error">
              <Typography variant="h6">Error loading book details</Typography>
              <Typography variant="body2">The book could not be found or loaded.</Typography>
            </Alert>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  // Extract book data with proper field names
  const cover = book.image_url || 'https://via.placeholder.com/300x450?text=No+Cover';
  const authorText = book.authors && Array.isArray(book.authors) 
    ? book.authors.map((a) => a.name).filter(Boolean).join(', ') 
    : 'Unknown Author';
  const avgRating = parseFloat(book.average_rating) || 0;
  const reviewsCount = book.rating_number || 0;
  
  // Extract publication info from details_jsonb or publication_date
  const publishedYear = book.publication_date 
    ? new Date(book.publication_date).getFullYear()
    : null;
  
  // Extract pages from details_jsonb
  const pagesInfo = book.details_jsonb?.Paperback || 
                    book.details_jsonb?.['Bonded Leather'] || 
                    book.details_jsonb?.Hardcover;
  const pages = pagesInfo ? pagesInfo.match(/\d+/)?.[0] : null;
  
  // Get ISBN
  const isbn = book.isbn_13 || book.isbn_10 || book.details_jsonb?.['ISBN 13'] || book.details_jsonb?.['ISBN 10'];

  return (
  <Grid container rowSpacing={4.5} columnSpacing={2.75}>
    {/* Back */}
    <Grid item xs={12}>
      <Button
        variant="text"
        startIcon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        color="secondary"
      >
        Back to list
      </Button>
    </Grid>

    {/* Book Overview */}
    <Grid item xs={12}>
      <MainCard>
        <Grid container spacing={4}>
          {/* LEFT: Cover + Actions */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.100'
                }}
              >
                <CardMedia
                  component="img"
                  image={cover}
                  alt={book.title}
                  sx={{
                    width: '100%',
                    aspectRatio: '2 / 3',
                    objectFit: 'cover'
                  }}
                />
              </Box>

              {/* Add to Library */}
              <MainCard
                contentSX={{ p: 2 }}
                sx={{ bgcolor: 'grey.50', border: 'none' }}
              >
                <Typography variant="h6" gutterBottom>
                  Add to Library
                </Typography>

                <Stack spacing={1.5}>
                  <AnimateButton>
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      startIcon={<HeartOutlined />}
                      onClick={() => handleAddToLibrary('wishlist')}
                      disabled={addingToLibrary}
                    >
                      Want to Read
                    </Button>
                  </AnimateButton>

                  <AnimateButton>
                    <Button
                      fullWidth
                      variant="contained"
                      color="info"
                      startIcon={<ClockCircleOutlined />}
                      onClick={() => handleAddToLibrary('reading')}
                      disabled={addingToLibrary}
                    >
                      Reading
                    </Button>
                  </AnimateButton>

                  <AnimateButton>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleOutlined />}
                      onClick={() => handleAddToLibrary('completed')}
                      disabled={addingToLibrary}
                    >
                      Completed
                    </Button>
                  </AnimateButton>
                </Stack>
              </MainCard>
            </Stack>
          </Grid>

          {/* RIGHT: Info */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Title */}
              <Box>
                <Typography variant="h2">{book.title}</Typography>
                <Typography variant="h5" color="text.secondary">
                  {authorText}
                </Typography>
              </Box>

              {/* Rating */}
              <MainCard
                contentSX={{ p: 2 }}
                sx={{
                  bgcolor: (theme) => theme.palette.primary.lighter,
                  border: 'none'
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Rating value={avgRating} precision={0.1} readOnly />
                  <Typography variant="h4" color="primary">
                    {avgRating.toFixed(1)}
                  </Typography>
                  <Chip
                    label={`${reviewsCount} ratings`}
                    color="primary"
                    size="small"
                  />
                </Stack>
              </MainCard>

              {/* Description */}
              {book.features && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    About this book
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ lineHeight: 1.8 }}
                  >
                    {book.features.split('---').slice(0, 3).join('\n')}
                  </Typography>
                </Box>
              )}

              {/* Meta */}
              <MainCard contentSX={{ p: 2 }} sx={{ bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  {publishedYear && (
                    <MetaItem icon={<CalendarOutlined />} label="Published" value={publishedYear} />
                  )}
                  {pages && (
                    <MetaItem icon={<BookOutlined />} label="Pages" value={pages} />
                  )}
                  {isbn && (
                    <MetaItem icon={<FileTextOutlined />} label="ISBN" value={isbn} />
                  )}
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
    </Grid>

    {/* Reviews */}
    <Grid item xs={12}>
      <MainCard>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Reader Reviews</Typography>
            <Typography variant="body2" color="text.secondary">
              What readers think about this book
            </Typography>
          </Box>

          {reviewsLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ReviewList
              reviews={reviews}
              onSubmit={handleSubmitReview}
              onUpdate={handleUpdateReview}
              onDelete={handleDeleteReview}
            />
          )}
        </Stack>
      </MainCard>
    </Grid>
  </Grid>
);

}

export default BookDetail;

function MetaItem({ icon, label, value }) {
  return (
    <Grid item xs={12} sm={6}>
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Typography variant="body2" color="text.secondary">
          {label}:
        </Typography>
        <Typography variant="body1">{value}</Typography>
      </Stack>
    </Grid>
  );
}

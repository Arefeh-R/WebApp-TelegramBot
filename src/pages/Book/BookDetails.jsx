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
  ArrowLeftOutlined,
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined
} from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import ReviewList from 'components/reviews/ReviewList';
import { useGetBook } from 'hooks/useBooks';
import { useGetReviews, addReview, updateReview, deleteReview } from 'hooks/useReviews';
import { addBookToLibrary } from 'hooks/useBooks';

// ==============================|| BOOK DETAIL PAGE ||============================== //

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book, bookLoading, bookError } = useGetBook(id);
  const { reviews, reviewsLoading } = useGetReviews(id);
  const [addingToLibrary, setAddingToLibrary] = useState(false);

  const handleAddToLibrary = async (status) => {
    setAddingToLibrary(true);
    await addBookToLibrary(book.parent_asin || id, status);
    setAddingToLibrary(false);
  };

  if (bookLoading) {
    return (
      <MainCard>
        <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
          <CircularProgress size={60} />
          <Typography color="text.secondary">Loading book details…</Typography>
        </Stack>
      </MainCard>
    );
  }

  if (bookError || !book) {
    return (
      <MainCard>
        <Alert severity="error">
          <Typography variant="h6">Failed to load book</Typography>
        </Alert>
      </MainCard>
    );
  }

  // ---------- extracted data ----------
  const cover = book.image_url || 'https://via.placeholder.com/300x450?text=No+Cover';
  const authors = book.authors?.map((a) => a.name).join(', ') || 'Unknown';
  const rating = Number(book.average_rating) || 0;
  const ratingCount = book.rating_number || 0;
  const year = book.publication_date ? new Date(book.publication_date).getFullYear() : null;
  const pages =
    book.details_jsonb?.Paperback?.match(/\d+/)?.[0] ||
    book.details_jsonb?.Hardcover?.match(/\d+/)?.[0];
  const isbn = book.isbn_13 || book.isbn_10;

  return (
    <Grid container spacing={3}>
      {/* Back */}
      <Grid item xs={12}>
        <Button
          startIcon={<ArrowLeftOutlined />}
          variant="outlined"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Grid>

      {/* MAIN LAYOUT */}
      <Grid
        item
        xs={12}
      >
        <Grid
          container
          spacing={3}
          alignItems="stretch"
          direction={{ xs: 'column', md: 'row' }}
        >
          {/* COVER COLUMN */}
          <Grid item xs={12} md={4} lg={3}>
            <MainCard
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '2 / 3',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.100'
                }}
              >
                <CardMedia
                  component="img"
                  image={cover}
                  alt={book.title}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </MainCard>
          </Grid>

          {/* CONTENT + ACTIONS */}
          <Grid item xs={12} md={8} lg={9}>
            <Stack spacing={3} height="100%">
              {/* BOOK INFO */}
              <MainCard>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h2">{book.title}</Typography>
                    <Typography variant="h5" color="text.secondary">
                      by {authors}
                    </Typography>
                  </Box>

                  {/* Rating */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Rating value={rating} precision={0.1} readOnly />
                    <Typography variant="h4" color="primary">
                      {rating.toFixed(1)}
                    </Typography>
                    <Chip
                      label={`${ratingCount} ratings`}
                      color="primary"
                      size="small"
                    />
                  </Stack>

                  {/* Categories */}
                  {book.categories?.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {book.categories.map((c) => (
                        <Chip
                          key={c.category_id}
                          label={c.category_name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  )}

                  <Divider />

                  {/* Description */}
                  {book.features && (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}
                    >
                      {book.features.split('---')[0]}
                    </Typography>
                  )}

                  <Divider />

                  {/* Details */}
                  <Stack spacing={1.2}>
                    {year && (
                      <Stack direction="row" spacing={1}>
                        <CalendarOutlined />
                        <Typography>Published: {year}</Typography>
                      </Stack>
                    )}
                    {pages && (
                      <Stack direction="row" spacing={1}>
                        <BookOutlined />
                        <Typography>Pages: {pages}</Typography>
                      </Stack>
                    )}
                    {isbn && (
                      <Stack direction="row" spacing={1}>
                        <FileTextOutlined />
                        <Typography>ISBN: {isbn}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </MainCard>

              {/* ACTIONS (FIXED & CONSISTENT) */}
              <MainCard
                sx={{
                  bgcolor: 'primary.lighter',
                  border: 'none'
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Add to your library
                </Typography>

                <Stack spacing={2}>
                  <AnimateButton>
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      startIcon={<HeartOutlined />}
                      disabled={addingToLibrary}
                      onClick={() => handleAddToLibrary('wishlist')}
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
                      disabled={addingToLibrary}
                      onClick={() => handleAddToLibrary('reading')}
                    >
                      Currently Reading
                    </Button>
                  </AnimateButton>

                  <AnimateButton>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleOutlined />}
                      disabled={addingToLibrary}
                      onClick={() => handleAddToLibrary('completed')}
                    >
                      Mark as Read
                    </Button>
                  </AnimateButton>
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </Grid>

      {/* REVIEWS */}
      <Grid item xs={12}>
        <MainCard>
          <Typography variant="h4" gutterBottom>
            Reader Reviews
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {reviewsLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <ReviewList
              reviews={reviews}
              onSubmit={(data) => addReview(id, data)}
              onUpdate={(rid, data) => updateReview(id, rid, data)}
              onDelete={(rid) => deleteReview(id, rid)}
            />
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}

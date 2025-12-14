import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Material UI
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
  CardMedia,
  useTheme
} from '@mui/material';

// Icons
import {
  HeartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
  ReadOutlined
} from '@ant-design/icons';

// Project Imports
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import ReviewList from 'components/reviews/ReviewList';
import { useGetBook, addBookToLibrary } from 'hooks/useBooks';
import { useGetReviews, addReview, updateReview, deleteReview } from 'hooks/useReviews';

// ==============================|| BOOK DETAIL - REDESIGNED ||============================== //

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  // Hooks
  const { book, bookLoading, bookError } = useGetBook(id);
  const { reviews, reviewsLoading } = useGetReviews(id);
  const [addingToLibrary, setAddingToLibrary] = useState(false);

  // Handlers
  const handleAddToLibrary = async (status) => {
    setAddingToLibrary(true);
    await addBookToLibrary(book.parent_asin || id, status);
    setAddingToLibrary(false);
  };

  // Loading State
  if (bookLoading) {
    return (
      <MainCard>
        <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
          <CircularProgress size={60} />
          <Typography color="text.secondary">در حال بارگزاری...</Typography>
        </Stack>
      </MainCard>
    );
  }

  // Error State
  if (bookError || !book) {
    return (
      <MainCard>
        <Alert severity="error">
          <Typography variant="h6">خطا در دریافت اطلاعات کتاب.</Typography>
        </Alert>
      </MainCard>
    );
  }

  // Data Preparation
  const cover = book.image_url || 'https://via.placeholder.com/300x450?text=No+Cover';
  const authors = book.authors?.map((a) => a.name).join(', ') || 'Unknown';
  const rating = Number(book.average_rating) || 0;
  const ratingCount = book.rating_number || 0;
  const year = book.publication_date ? new Date(book.publication_date).getFullYear() : 'N/A';
  const parent_asin = book.parent_asin || 'N/A';
  const isbn = book.isbn_13 || book.isbn_10 || 'N/A';

  return (
    <Grid container spacing={3}>
      {/* 1. Header Navigation */}
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h3">جزئیات کتاب</Typography>
          <Button
            startIcon={<ArrowLeftOutlined />}
            variant="outlined"
            color="secondary"
            onClick={() => navigate(-1)}
          >
            بازگشت
          </Button>
        </Stack>
      </Grid>

      {/* 2. HERO CARD: Cover + Info + Actions */}
      <Grid item xs={12}>
        {/* CRITICAL CHANGE: Set MainCard content={false} and no margin/padding overrides here. 
            The Grid item xs=12 should ensure full width. */}
        <MainCard content={false}> 
          <Grid container>
            {/* Left Side: Book Cover */}
            <Grid item xs={12} md={4} lg={3}>
              <Box
                sx={{
                  height: '100%',
                  p: 2,
                  bgcolor: 'grey.50',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  // Ensure borders align with the Mantis style
                  borderRight: { md: `1px solid ${theme.palette.divider}` },
                  borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' }
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: '220px',
                    boxShadow: theme.shadows[3],
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <CardMedia
                    component="img"
                    image={cover}
                    alt={book.title}
                    sx={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Side: Info & Actions */}
            <Grid item xs={12} md={8} lg={9}>
              <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  {/* Title & Author */}
                  <Box>
                    <Typography variant="h2" sx={{ mb: 0.5 }}>
                      {book.title}
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 400 }}>
                      نوشته شده توسط <Typography component="span" variant="h5" color="primary">{authors}</Typography>
                    </Typography>
                  </Box>

                  {/* Rating */}
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Rating value={rating} precision={0.1} readOnly size="medium" />
                    <Typography variant="h5" sx={{ pt: 0.5 }}>{rating.toFixed(1)}</Typography>
                    <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center' }} />
                    <Typography color="text.secondary">{ratingCount} رای</Typography>
                  </Stack>

                  {/* Tags */}
                  {book.categories?.length > 0 && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      {book.categories.slice(0, 5).map((c) => (
                        <Chip
                          key={c.category_id}
                          label={c.category_name}
                          size="small"
                          variant="outlined"
                          sx={{ bgcolor: 'transparent' }}
                        />
                      ))}
                    </Stack>
                  )}
                  
                  {/* Technical Specs Grid (Compact) */}
                  <Grid container spacing={2} sx={{ mt: 2, p: 2, bgcolor: 'primary.lighter', borderRadius: 2 }}>
                     <Grid item xs={6} sm={4}>
                        <Stack spacing={0.5}>
                           <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                              <CalendarOutlined /> <Typography variant="caption">سال انتشار</Typography>
                           </Stack>
                           <Typography variant="body1">{year}</Typography>
                        </Stack>
                     </Grid>
                     <Grid item xs={6} sm={4}>
                        <Stack spacing={0.5}>
                           <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                              <BookOutlined /> <Typography variant="caption">کد مرجع</Typography>
                           </Stack>
                           <Typography variant="body1">{parent_asin}</Typography>
                        </Stack>
                     </Grid>
                     <Grid item xs={12} sm={4}>
                        <Stack spacing={0.5}>
                           <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                              <FileTextOutlined /> <Typography variant="caption">شابک (ISBN)</Typography>
                           </Stack>
                           <Typography variant="body1">{isbn}</Typography>
                        </Stack>
                     </Grid>
                  </Grid>
                </Stack>

                {/* --- ACTION BUTTONS ROW --- */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                    افزودن به وضعیت مطالعه:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <AnimateButton>
                        <Button
                          fullWidth
                          size="large"
                          variant="contained"
                          color="warning"
                          startIcon={<HeartOutlined />}
                          disabled={addingToLibrary}
                          onClick={() => handleAddToLibrary('wishlist')}
                        >
                          می خواهم بخوانم
                        </Button>
                      </AnimateButton>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <AnimateButton>
                        <Button
                          fullWidth
                          size="large"
                          variant="contained"
                          color="info"
                          startIcon={<ClockCircleOutlined />}
                          disabled={addingToLibrary}
                          onClick={() => handleAddToLibrary('reading')}
                        >
                          در حال خواندن
                        </Button>
                      </AnimateButton>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <AnimateButton>
                        <Button
                          fullWidth
                          size="large"
                          variant="outlined"
                          color="success"
                          startIcon={<CheckCircleOutlined />}
                          disabled={addingToLibrary}
                          onClick={() => handleAddToLibrary('completed')}
                        >
                          خوانده شده
                        </Button>
                      </AnimateButton>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      {/* 3. Description Section */}
      <Grid item xs={12}>
        <MainCard title={<Stack direction="row" spacing={1} alignItems="center"><ReadOutlined /><Typography variant="h4">درباره این کتاب</Typography></Stack>}>
          <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line', color: 'text.secondary' }}>
            {book.features ? book.features.split('---')[0] : 'توضیحاتی برای این کتاب ثبت نشده است.'}
          </Typography>
        </MainCard>
      </Grid>

      {/* 4. Reviews Section */}
      <Grid item xs={12}>
        <MainCard title="دیدگاه کاربران">
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
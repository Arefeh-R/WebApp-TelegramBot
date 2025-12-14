import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Stack,
  Typography,
  Rating,
  Button,
  TextField
} from '@mui/material';

// project imports
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';

// ==============================|| REVIEW FORM ||============================== //

export default function ReviewForm({ onSubmit, initialData = null, onCancel }) {
  const [rating, setRating] = useState(initialData?.rating ? parseFloat(initialData.rating) : 0);
  const [title, setTitle] = useState(initialData?.title || '');
  const [reviewText, setReviewText] = useState(initialData?.review_text || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('لطفا امتیاز خود را انتخاب کنید');
      return;
    }

    setSubmitting(true);
    
    try {
      await onSubmit({ 
        rating: rating.toString(), 
        title: title.trim(),
        review_text: reviewText.trim() 
      });
      
      // Reset form only for new reviews
      if (!initialData) {
        setRating(0);
        setTitle('');
        setReviewText('');
      }
    } catch (error) {
      console.error('خطا در ارسال نقد:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainCard
      boxShadow
      title={initialData ? 'ویرایش نقد' : 'نوشتن نقد'}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Rating */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              امتیاز شما *
            </Typography>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue || 0)}
              size="large"
              precision={0.5}
            />
          </Box>

          {/* Review Title */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              عنوان نقد
            </Typography>
            <TextField
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="نقد خود را در چند کلمه خلاصه کنید"
              variant="outlined"
            />
          </Box>

          {/* Review Text */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              متن نقد
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="نظر خود را درباره این کتاب بنویسید..."
              variant="outlined"
            />
          </Box>

          {/* Buttons */}
          <Stack direction="row" spacing={2}>
            <AnimateButton>
              <Button
                variant="contained"
                type="submit"
                disabled={submitting || rating === 0}
                size="large"
              >
                {submitting ? 'در حال ارسال...' : (initialData ? 'بروزرسانی نقد' : 'ثبت نقد')}
              </Button>
            </AnimateButton>
            
            {(initialData || onCancel) && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={submitting}
                size="large"
              >
                انصراف
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </MainCard>
  );
}

ReviewForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    review_text: PropTypes.string
  }),
  onCancel: PropTypes.func
};

ReviewForm.defaultProps = {
  initialData: null,
  onCancel: null
};
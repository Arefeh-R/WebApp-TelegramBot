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
      alert('Please select a rating');
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
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainCard
      boxShadow
      title={initialData ? 'Edit Review' : 'Write a Review'}
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Rating */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Your Rating *
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
              Review Title
            </Typography>
            <TextField
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your review in a few words"
              variant="outlined"
            />
          </Box>

          {/* Review Text */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Your Review
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this book..."
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
                {submitting ? 'Submitting...' : (initialData ? 'Update Review' : 'Submit Review')}
              </Button>
            </AnimateButton>
            
            {(initialData || onCancel) && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={submitting}
                size="large"
              >
                Cancel
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
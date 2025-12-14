import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Stack,
  Typography,
  Button,
  Divider,
  Chip,
  Alert
} from '@mui/material';

// project imports
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import AnimateButton from 'components/@extended/AnimateButton';
import useAuth from 'hooks/useAuth';

// assets
import { BookOutlined } from '@ant-design/icons';

// ==============================|| REVIEW LIST ||============================== //

export default function ReviewList({ reviews = [], onSubmit, onUpdate, onDelete }) {
  const { user, isLoggedIn } = useAuth();
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Handle submit (add or update)
  const handleSubmitReview = async (reviewData) => {
    if (editingReview) {
      await onUpdate?.(editingReview.review_id, reviewData);
      setEditingReview(null);
    } else {
      await onSubmit?.(reviewData);
      setShowForm(false);
    }
  };

  // Handle delete with confirmation
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این نقد را حذف کنید؟')) {
      await onDelete?.(reviewId);
    }
  };

  // Handle edit click
  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowForm(false); // Hide add form if open
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  // Check if current user already reviewed
  const userReview = reviews.find((r) => {
    if (user?.id && r.user?.id) {
      return r.user.id === user.id;
    }
    if (user?.email && r.user?.email) {
      return r.user.email === user.email;
    }
    if (user?.username && r.reviewer_display) {
      return r.reviewer_display.includes(user.username);
    }
    return false;
  });

  // Check if user is owner of a review
  const isReviewOwner = (review) => {
    if (!user) return false;
    if (user.id && review.user?.id) return review.user.id === user.id;
    if (user.email && review.user?.email) return review.user.email === user.email;
    return false;
  };

  return (
    <Stack spacing={3}>
      {/* Add Review Section - Only if logged in and hasn't reviewed yet */}
      {isLoggedIn && !userReview && !editingReview && (
        <>
          {!showForm ? (
            <AnimateButton>
              <Button
                variant="contained"
                size="large"
                onClick={() => setShowForm(true)}
              >
                نوشتن نقد
              </Button>
            </AnimateButton>
          ) : (
            <ReviewForm
              onSubmit={handleSubmitReview}
              onCancel={() => setShowForm(false)}
            />
          )}
        </>
      )}

      {/* Edit Form - Show when editing */}
      {editingReview && (
        <ReviewForm
          initialData={editingReview}
          onSubmit={handleSubmitReview}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Not Logged In Message */}
      {!isLoggedIn && (
        <Alert severity="info">
          برای نوشتن نقد لطفا وارد شوید
        </Alert>
      )}

      {/* Already Reviewed Message */}
      {isLoggedIn && userReview && !editingReview && (
        <Alert severity="success" icon={false}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">
              شما قبلا این کتاب را نقد کرده‌اید
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleEditReview(userReview)}
            >
              ویرایش نقد
            </Button>
          </Stack>
        </Alert>
      )}

      {/* Reviews List Header */}
      {reviews.length > 0 && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              همه نقدها
            </Typography>
            <Chip
              label={`${reviews.length} نقد`}
              color="primary"
              variant="outlined"
            />
          </Stack>
          <Divider />
        </>
      )}

      {/* Empty State */}
      {reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <BookOutlined style={{ fontSize: 64, color: '#bbb', marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            هنوز نقدی ثبت نشده است
          </Typography>
          <Typography variant="body2" color="text.secondary">
            اولین نفری باشید که این کتاب را نقد می‌کند!
          </Typography>
        </Box>
      ) : (
        /* Reviews Grid */
        <Stack spacing={2}>
          {reviews.map((review) => (
            <ReviewCard
              key={review.review_id}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              isOwner={isReviewOwner(review)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

ReviewList.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      review_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ),
  onSubmit: PropTypes.func,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func
};

ReviewList.defaultProps = {
  reviews: []
};
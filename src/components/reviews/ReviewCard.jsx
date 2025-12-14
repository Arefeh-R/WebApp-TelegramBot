import PropTypes from 'prop-types';
import {
  Stack,
  Typography,
  Rating,
  Avatar,
  IconButton,
  Chip,
  Box
} from '@mui/material';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| REVIEW CARD ||============================== //

export default function ReviewCard({ review, onEdit, onDelete, isOwner }) {
  // Format date
  const formattedDate = review.review_date
    ? new Date(review.review_date).toLocaleDateString('fa-IR') : '';

  // Handle reviewer display name
  const reviewerName = review.reviewer_display || review.user?.username || review.user?.email || 'ناشناس';
  const reviewerInitial = reviewerName.charAt(0).toUpperCase();

  // Parse rating as float
  const ratingValue = parseFloat(review.rating) || 0;

  return (
    <MainCard
      boxShadow
      sx={{
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <Stack spacing={2}>
        {/* User Info & Actions */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              {reviewerInitial}
            </Avatar>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">
                  {reviewerName}
                </Typography>
                {review.verified_purchase && (
                  <Chip
                    icon={<CheckCircleOutlined />}
                    label="خرید تایید شده"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 20 }}
                  />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {formattedDate}
              </Typography>
            </Box>
          </Stack>

          {/* Edit/Delete Actions - Only show for owner */}
          {isOwner && (
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(review)}
                aria-label="ویرایش نقد"
              >
                <EditOutlined />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(review.review_id)}
                aria-label="حذف نقد"
              >
                <DeleteOutlined />
              </IconButton>
            </Stack>
          )}
        </Stack>

        {/* Review Title */}
        {review.title && (
          <Typography variant="h6" fontWeight={500}>
            {review.title}
          </Typography>
        )}

        {/* Rating */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Rating value={ratingValue} readOnly precision={0.1} size="small" />
          <Typography variant="body2" color="text.secondary">
            {ratingValue.toFixed(1)}
          </Typography>
        </Stack>

        {/* Review Text */}
        {review.review_text && (
          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
            {review.review_text}
          </Typography>
        )}

        {/* Helpful Vote Count */}
        {review.helpful_vote > 0 && (
          <Typography variant="caption" color="text.secondary">
            {review.helpful_vote} نفر این نقد را لایک کردند
          </Typography>
        )}
      </Stack>
    </MainCard>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    review_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    review_text: PropTypes.string,
    review_date: PropTypes.string,
    reviewer_display: PropTypes.string,
    verified_purchase: PropTypes.bool,
    helpful_vote: PropTypes.number,
    user: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      username: PropTypes.string,
      email: PropTypes.string
    })
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isOwner: PropTypes.bool
};

ReviewCard.defaultProps = {
  isOwner: false
};